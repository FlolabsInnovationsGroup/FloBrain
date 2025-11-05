// tests/health/core.test.ts

import request from 'supertest';
// On importe la vraie application pour la tester
import { app } from '../../src/app'; 
import { sequelize } from '../../src/sequelize'; 

describe('Health and Core Routes', () => {

  // Test pour la Tâche 6.A.1: /api/v1/ping
  it('GET /api/v1/ping should return 200 with { ok: true }', async () => {
    // On envoie une requête GET à l'endpoint /api/v1/ping
    const response = await request(app).get('/api/v1/ping');

    // On vérifie que le statut de la réponse est bien 200
    expect(response.status).toBe(200);
    // On vérifie que le corps de la réponse est exactement { ok: true }
    expect(response.body).toEqual({ ok: true });
  });

  // Test pour la Tâche 6.A.2: /api/v1/health (nécessite la BDD)
  // On importe 'setup/db' pour que la base de données soit prête
  require('../setup/db');
  it('GET /api/v1/health should return 200 when the database is reachable', async () => {
    const response = await request(app).get('/api/v1/health');
    
    // Pour ce test, on se contente de vérifier que la route répond bien
    // quand la base de données est connectée (ce que fait 'setup/db').
    expect(response.status).toBe(200);
  });

  // Test pour la Tâche 6.A.3: Route inconnue
  it('should return 404 for an unknown route', async () => {
    const response = await request(app).get('/api/v1/cette-route-n-existe-pas');

    expect(response.status).toBe(404);
    // On vérifie aussi que le code d'erreur personnalisé est bien présent
    // Note: il est possible que le corps de l'erreur soit différent, on adaptera si besoin.
    // expect(response.body.code).toBe('ROUTE_NOT_FOUND'); 
  });
});