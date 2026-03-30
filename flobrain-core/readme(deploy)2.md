# Backend deployment guide (GitHub Actions → S3 → SSM → EC2)

This document is a **complete, ordered checklist** of the deployment process used in flomad travel backend.

---

## What you are building

|           Piece               |                                                  Purpose                                                   |
|-------------------------------|------------------------------------------------------------------------------------------------------------|
| **GitHub Actions**            | On push to the deploy branch, build the JAR and run deploy steps.                                          |
| **Amazon S3**                 | Holds the built JAR briefly; the server downloads it with a **presigned URL** (no public bucket required). |
| **AWS Systems Manager (SSM)** | Runs a shell script **on the EC2 instance** from CI without SSH keys in GitHub.                            |
| **EC2**                       | Runs `java -jar …` under the `ubuntu` user, with config in `/home/ubuntu/app/.env`.                        |

**End-to-end flow:** push to branch → `mvn package` → upload JAR to S3 → generate presigned URL → `ssm send-command` runs script on instance → script downloads JAR, writes `.env`, restarts Java, curls health → workflow waits for SSM and fails the job if the remote script fails.

The canonical workflow file in this repo is:

`.github/workflows/deploy.yml`

---

## Part A — One-time AWS setup

### A1. Choose region

This project’s workflow uses **`us-east-1`**. Pick a region and use it consistently for EC2, S3, SSM, and IAM.

---

### A2. Create an S3 bucket for deploy artifacts

1. In the AWS console (or CLI), create a bucket, e.g. `your-org-deploy-temp-<unique-suffix>`.
2. **Block public access** can stay on; the EC2 host uses a **presigned URL**, not anonymous access.
3. Note the **bucket name** and the **object key** you will use (e.g. `MyApp-0.0.1-SNAPSHOT.jar`).

You will paste the bucket name into the GitHub Actions workflow in two places: `aws s3 cp` and `aws s3 presign`.

---

### A3. Launch and prepare the EC2 instance

1. **AMI:** Ubuntu (or another Linux where your stack runs). The workflow assumes user **`ubuntu`** and path **`/home/ubuntu/app`**.
2. **Instance type:** Enough RAM/CPU for your JVM (this workflow uses `-Xmx2048m`).
3. **Security group:** Allow **inbound TCP** on the port your app uses (here **8080** for HTTP, plus **22** only if you still want SSH for debugging).
4. **SSM connectivity:** The instance must be manageable by **Session Manager**:
   - Attach an **IAM instance profile** with **`AmazonSSMManagedInstanceCore`** (or an equivalent policy that lets the instance register with SSM and receive commands).
   - Ensure a **route to SSM endpoints** (public subnet + public IP, or private subnet + VPC endpoints / NAT for SSM).
5. After first boot, **one-time on the instance** (SSH or SSM Session Manager):
   - Install **Java 17+** (same major version you build with in CI).
   - Create the app directory and ownership:
     ```bash
     sudo mkdir -p /home/ubuntu/app
     sudo chown ubuntu:ubuntu /home/ubuntu/app
     ```
6. Note the EC2 **instance ID** (e.g. `i-0123456789abcdef0`). You will put it in the workflow as `--instance-ids`.

---

### A4. IAM identity for GitHub Actions (access key or OIDC)

Create an IAM **user** (with access keys) or **OIDC role** trusted by GitHub. Minimum permissions for **this** deployment pattern:

**S3 (deploy bucket only, or prefix if you prefer)**

- `s3:PutObject`, `s3:GetObject` on `arn:aws:s3:::your-bucket-name/*`
- Optionally `s3:ListBucket` on `arn:aws:s3:::your-bucket-name` if your tooling needs it

**SSM**

- `ssm:SendCommand` scoped to your instance ARN(s) and to document `AWS-RunShellScript`
- `ssm:GetCommandInvocation`
- `ssm:ListCommandInvocations` (often needed for wait/list APIs depending on CLI usage)

**Optional but common**

- `ssm:WaitCommandExecuted` is not a separate permission; the CLI uses polling with `GetCommandInvocation`.

If you use **access keys**, store them only in GitHub Secrets (next part). Do not commit them.

---

## Part B — One-time GitHub repository setup

### B1. Add the workflow file

1. In your backend repo, create `.github/workflows/deploy.yml`.
2. Copy the structure from this project’s `deploy.yml` and replace every **project-specific** value (see Part D).

---

### B2. Configure GitHub Secrets

Add the following secrets in the repo: **Settings → Secrets and variables → Actions**.

**AWS (required for this workflow)**

| Secret name             |                     Used for                       |
|-------------------------|----------------------------------------------------|
| `AWS_ACCESS_KEY_ID`     | `configure-aws-credentials` and AWS CLI in the job |
| `AWS_SECRET_ACCESS_KEY` | Same                                               |

**Application / third-party keys (this project writes them into `/home/ubuntu/app/.env` on each deploy)**

|         Secret name        | In workflow `.env` line      |
|----------------------------|------------------------------|
| `SPRING_AI_OPENAI_API_KEY` | `SPRING_AI_OPENAI_API_KEY=…` |
| `GOOGLE_API_KEY`           | `GOOGLE_API_KEY=…`           |
| `GEOAPIFY_API_KEY`         | `GEOAPIFY_API_KEY=…`         |
| `VIATOR_API_KEY`           | `VIATOR_API_KEY=…`           |
| `VIATOR_PARTNER_KEY`       | `VIATOR_PARTNER_KEY=…`       |
| `AMADEUS_API_KEY`          | `AMADEUS_API_KEY=…`          |
| `AMADEUS_API_SECRET`       | `AMADEUS_API_SECRET=…`       |
| `JWT_SECRET`               | `JWT_SECRET=…`               |
| `WEATHER_API_KEY`          | `WEATHER_API_KEY=…`          |

**Values fixed inside the workflow (not separate secrets in this repo)**

- `SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/travel_planner` — change for another project if MongoDB is remote or a different DB name.
- `SPRING_PROFILES_ACTIVE=prod` — ensures Spring loads production configuration.

For a **new** project, add or remove secret lines in the SSM script block so they match your `application-prod` / env var names.

---

### B3. Set the deploy branch

In `deploy.yml`, under `on.push.branches`, this project uses **`master`**. If your default branch is **`main`**, change it to:

```yaml
on:
  push:
    branches:
      - main
```

---

## Part C — What each workflow step does (mirror of this repo)

When you push to the configured branch, the job runs:

1. **Checkout Repository** — `actions/checkout@v3` (default shallow clone is enough for Maven build).
2. **Set up JDK 17** — `actions/setup-java@v3` with Temurin 17 and Maven cache.
3. **Build with Maven** — `mvn clean package -DskipTests`  
   - Produces `target/<final-jar-name>.jar` (here: `Flomad-AI-planner-0.0.1-SNAPSHOT.jar`).
4. **Configure AWS credentials** — `aws-actions/configure-aws-credentials@v4` with region **`us-east-1`** (change if needed).
5. **Upload JAR to S3** — `aws s3 cp target/….jar s3://<bucket>/….jar`
6. **Deploy via AWS SSM** — inline script that:
   - Runs `aws s3 presign s3://<bucket>/<same-key>.jar --expires-in 300`
   - Calls `aws ssm send-command` with:
     - `--instance-ids "<your-instance-id>"`
     - `--document-name "AWS-RunShellScript"`
     - `--parameters commands=[ ... ]` — a JSON array of shell lines (each line is one string in the array)
   - Remote script actions in order:
     1. `curl -f` downloads the JAR to `/tmp/…`
     2. `sudo mv` into `/home/ubuntu/app/` and `chown ubuntu:ubuntu`
     3. `sudo tee /home/ubuntu/app/.env` writes env vars (GitHub secret values interpolated by Actions **at workflow render time** — they become literals in the command sent to SSM)
     4. `sudo chown ubuntu:ubuntu` on `.env`
     5. `sudo pkill -f Flomad-AI-planner || true` stops old process (match your JAR/process string)
     6. `sleep 5`
     7. `cd /home/ubuntu/app` and `sudo -u ubuntu nohup java -Xmx2048m -Xms512m -XX:+UseG1GC -jar <jar> > stdout.log 2>&1 &`
     8. `sleep 15`
     9. `curl -f http://localhost:8080/actuator/health || exit 1`
   - Workflow captures **CommandId**, runs `aws ssm wait command-executed`, then `aws ssm get-command-invocation` for logs.

If any step fails (including health check), the GitHub Action should fail.

---

## Part D — Checklist to port this to another project

1. **Build**
   - Keep or change JDK version in `setup-java`.
   - Change Maven command only if needed (e.g. different profile: `-Pprod`).
2. **Artifact name**
   - Match `pom.xml` `<build><finalName>` / default `${artifactId}-${version}.jar`.
   - Update **every** reference: `s3 cp`, `presign`, `curl` output path, `mv` target, `java -jar` argument, and `pkill -f` pattern.
3. **S3**
   - Replace bucket name in `aws s3 cp` and `aws s3 presign`.
4. **EC2**
   - Replace `--instance-ids` in `send-command`, `wait`, and `get-command-invocation`.
5. **Paths and user**
   - If not using `/home/ubuntu/app` or `ubuntu`, change `mv`, `chown`, `cd`, and `sudo -u`.
6. **`.env` block**
   - Replace with the exact variables your app reads in production; add corresponding GitHub Secrets.
7. **Health check**
   - Change URL/port/path to your liveness endpoint; ensure it returns HTTP **2xx** when healthy.
8. **Monorepo**
   - Add `defaults.run.working-directory: path/to/backend` or `working-directory` on the Maven and S3 steps so `target/` resolves correctly.
9. **MongoDB / data**
   - If the database is not on localhost on the instance, set `SPRING_DATA_MONGODB_URI` via a secret or a fixed string in the workflow — do not commit credentials to the repo.

---

## Part E — Reference values used in *this* repository’s workflow

Use these only as examples when copying to a new repo; replace all of them.

| Item                   | Value in this project                    |
|------------------------|------------------------------------------|
| JAR file name          | `Flomad-AI-planner-0.0.1-SNAPSHOT.jar`   |
| S3 bucket              | `flomad-deploy-temp-31756fdf`            |
| EC2 instance ID        | `i-0fc71de8cfc123fd8`                    |
| AWS region (workflow)  | `us-east-1`                              |
| App directory          | `/home/ubuntu/app`                       |
| JVM flags              | `-Xmx2048m -Xms512m -XX:+UseG1GC`        |
| Health URL             | `http://localhost:8080/actuator/health`  |
| Process match for stop | `Flomad-AI-planner` (used in `pkill -f`) |
| SSM document           | `AWS-RunShellScript`                     |
| Presign expiry         | `300` seconds                            |

---

## Part F — Verifying a deploy

1. Open **GitHub → Actions** and select the latest **Deploy to AWS EC2** run.
2. Confirm **Build with Maven** and **Upload JAR to S3** succeeded.
3. Open the **Deploy via AWS SSM** step log; note **Command ID** if printed.
4. In AWS **Systems Manager → Run Command**, find the command and inspect **Output** if the job failed.
5. On the instance (SSM Session Manager or SSH):  
   - `tail -f /home/ubuntu/app/stdout.log`  
   - `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health` → expect **200** (or your app’s healthy code).
---

## Part G — Production ready modifications

### G1. Rollback (Required)
- Keep previous version before deploy:
  ```bash
  cp app.jar app-prev.jar || true
````

* On failure:

  ```bash
  mv app-prev.jar app.jar
  ```

---

### G2. Process Management

Use `systemd` instead of `nohup`:

```bash
sudo systemctl restart app
```

---

### G3. Artifact Versioning (Required)

Avoid overwriting builds:

```bash
MyApp-${GITHUB_SHA}.jar
```

---

### G4. Health Check Retry

Avoid fixed wait times:

```bash
for i in {1..10}; do
  curl -f http://localhost:8080/actuator/health && break
  sleep 5
done || exit 1
```

---

### G5. Secrets Management

Do not pass secrets via CI.
Use AWS SSM Parameter Store or Secrets Manager.

---

### G6. Script Safety

Fail fast:

```bash
set -euo pipefail
```

---

### G7. Logs & Cleanup

* Rotate logs or use `journalctl`
* Clean temp files:

  ```bash
  rm -f /tmp/*.jar
  ```
---

### G8. Concurrency Control

Prevent overlapping deploys:

```yaml
concurrency:
  group: deploy
  cancel-in-progress: true
```
---

### G9. Environment Separation

* `staging` → test server
* `main` → production

```
