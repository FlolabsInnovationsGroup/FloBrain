// tests/media/media.integration.test.ts

import request from 'supertest';
import { app } from '../../src/app'; 
import { MediaRecording } from '../../src/models/MediaRecording';
import '../setup/db'; // Nécessaire pour que la BDD soit prête
import { resetDb, seedBasic } from '../fixtures/db';
import { sequelize } from '../../src/sequelize';
import fs from 'fs';
import { joinRepoPath } from '../../src/utils/paths';

describe('Media API Integration Tests', () => {

  beforeEach(async () => {
    await resetDb();
    await seedBasic();
  });
  // Ce test va maintenant s'exécuter dans un environnement où la table 'media' existe.
  it('should upload a file, save it to the database, and return a 201 status', async () => {
    const imagePath = `${__dirname}/../../__tests__/fixtures/tiny.png`;
    const userIdForTest = 1;

    const response = await request(app)
      .post('/api/v1/media/upload')
      .field('media_type', 'image')
      .field('tags', 'integration,test')
      .attach('file', imagePath);

    // Vérifications
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    const responseData = response.body.data || response.body;
    expect(String(responseData.user_id)).toBe(String(userIdForTest));
    // Vérification en base de données
    const mediaId = responseData.id;
    const recordInDb = await MediaRecording.findByPk(mediaId);
    expect(recordInDb).not.toBeNull();
    if (recordInDb) {
      expect(String(recordInDb?.get('user_id'))).toBe(String(userIdForTest));
    }
  });

  it('should returns 413 for a file that is too large', async () => {
    //create a dummy large file buffer
    const largeBuffer = Buffer.alloc(300 * 1024 * 1024, 'a'); // 300 MB
    
    const response = await request(app)
      .post('/api/v1/media/upload')
      .field('media_type', 'image')
      .attach('file', largeBuffer, 'largefile.png');

      expect(response.status).toBe(413);
  });
  // Test pour la Tâche 6.C.3: Upload d'un type non supporté
  it('should return 415 for an unsupported media type', async () => {
    // On prétend envoyer une image, mais on envoie un fichier texte.
    const {sniffTrusted } = require('../../src/utils/mime');
    (sniffTrusted as jest.Mock).mockResolvedValueOnce(null);
    const textFilePath = `${__dirname}/../fixtures/fake-image.txt`;
    // Créez ce petit fichier texte dans tests/fixtures/
    require('fs').writeFileSync(textFilePath, 'this is not an image');

    const response = await request(app)
      .post('/api/v1/media/upload')
      .field('media_type', 'image') // On prétend que c'est une image...
      .attach('file', textFilePath); // ...mais on envoie un .txt

    // On s'attend à une erreur "Unsupported Media Type"
    expect(response.status).toBe(415);
  });
  // Test pour la Tâche 6.C.4: Lister les médias
  // ===========================================================================
  it('should list only media belonging to the authenticated user (User A)', async () => {
    // Note: Le 'requireAuth' factice nous identifie comme User A (ID 1)
    
    const response = await request(app).get('/api/v1/media');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    // On s'attend à recevoir un tableau de médias
    expect(Array.isArray(response.body.data)).toBe(true);
    
    // On vérifie que tous les médias retournés appartiennent bien à User A
    for (const media of response.body.data) {
      expect(media.user_id).toBe(1);
    }
  });
  // Test pour la Tâche 6.C.5: Accès non autorisé
  // ===========================================================================
  it('should return 404 when User A tries to get media owned by User B', async () => {
    // D'abord, on doit créer un média pour User B.
    // Pour ce test, on peut l'insérer directement dans la BDD.
    const mediaForUserB = await MediaRecording.create({
      id: 'media_for_user_b',
      user_id: 2, // ID de User B
      media_type: 'audio',
      timestamp: new Date(),
      file_path: '/fake/path/for/user/b.mp3',
      file_size: 12345,
      format: 'mp3',
      processing_status: 'processed',
    });

    // Maintenant, en tant que User A, on essaie de le récupérer
    const response = await request(app).get(`/api/v1/media/${mediaForUserB.get('id')}`);

    // La sécurité doit nous renvoyer un 404 pour ne pas révéler que l'objet existe
    expect(response.status).toBe(404);
  });
  // Test pour la Tâche 6.C.6: Mise à jour des tags
  // ===========================================================================
  it('should patch the tags of an owned media record', async () => {
    // On prend un média existant de User A (créé par les fixtures)
    const mediaIdToUpdate = '1';

    const response = await request(app)
      .patch(`/api/v1/media/${mediaIdToUpdate}`)
      .send({ tags: ['updated', 'new-tag'] }); // On envoie les nouveaux tags

    expect(response.status).toBe(200);
    expect(response.body.data.tags).toEqual(['updated', 'new-tag']);
  });
  // Test pour la Tâche 6.C.7: Suppression
  // ===========================================================================
  it('should delete an owned media record', async () => {
    const mediaIdToDelete = '2';

    // --- Action ---
    const record = await MediaRecording.findByPk(mediaIdToDelete);
    const relativePath = record!.get('file_path') as string;
    const absoluteFilePath = joinRepoPath(relativePath);

    // On crée un faux fichier à cet emplacement pour simuler son existence
    // La fonction `require('path').dirname` permet de créer les dossiers parents si besoin.
    fs.mkdirSync(require('path').dirname(absoluteFilePath), { recursive: true });
    fs.writeFileSync(absoluteFilePath, 'dummy content');

    // On vérifie que le fichier existe bien AVANT de lancer la requête
    expect(fs.existsSync(absoluteFilePath)).toBe(true);

    // --- 2. Action ---
    const deleteResponse = await request(app).delete(`/api/v1/media/${mediaIdToDelete}`);

    // --- 3. Vérifications ---
    // a) L'API a bien répondu
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.data.deleted).toBe(true);

    // b) Le fichier a bien été supprimé du disque (le test le plus important)
    expect(fs.existsSync(absoluteFilePath)).toBe(false);

    // c) L'enregistrement a bien été supprimé de la BDD
    const recordInDbAfterDelete = await MediaRecording.findByPk(mediaIdToDelete);
    expect(recordInDbAfterDelete).toBeNull();
  });
});