import pool from "../config/database";
import bcrypt from "bcrypt";

async function seed() {
  const client = await pool.connect();

  try {
    console.log("Starting seed...");

    // Vérifier si l'utilisateur de test existe déjà
    const userCheck = await client.query(
      "SELECT id FROM users WHERE email = $1",
      ["test@example.com"]
    );

    let userId: number;

    if (userCheck.rows.length === 0) {
      // Créer l'utilisateur de test
      const hashedPassword = await bcrypt.hash("password123", 10);
      const userResult = await client.query(
        "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id",
        ["test@example.com", hashedPassword, "Utilisateur Test"]
      );
      userId = userResult.rows[0].id;
      console.log("✓ User created");
    } else {
      userId = userCheck.rows[0].id;
      console.log("✓ User already exists");
    }

    // Compter les tâches existantes
    const taskCountResult = await client.query(
      "SELECT COUNT(*) as count FROM tasks WHERE user_id = $1",
      [userId]
    );
    const existingTaskCount = parseInt(taskCountResult.rows[0].count);

    if (existingTaskCount >= 8000) {
      console.log(
        `✓ Database already has ${existingTaskCount} tasks. Skipping seed.`
      );
      return;
    }

    // Générer 8000 tâches
    console.log("Generating 8000 tasks... This may take a moment.");

    const prefixes = [
      "Développer",
      "Tester",
      "Corriger",
      "Améliorer",
      "Refactorer",
      "Optimiser",
      "Analyser",
      "Documenter",
      "Déployer",
      "Configurer",
      "Réviser",
      "Valider",
      "Implémenter",
      "Concevoir",
      "Planifier",
    ];

    const subjects = [
      "API REST",
      "Interface utilisateur",
      "Base de données",
      "Architecture",
      "Module de paiement",
      "Système d'authentification",
      "Dashboard",
      "Formulaire de contact",
      "Page d'accueil",
      "Profil utilisateur",
      "Notifications",
      "Recherche",
      "Filtres",
      "Export de données",
      "Import de fichiers",
      "Génération de rapports",
      "Cache Redis",
      "Service de mail",
      "Logs applicatifs",
      "Tests unitaires",
    ];

    const statuses = ["todo", "in_progress", "done"];

    // Insertion par batch pour améliorer les performances
    const batchSize = 500;
    const totalTasks = 8000;

    for (let i = 0; i < totalTasks; i += batchSize) {
      const tasks = [];
      const remainingTasks = Math.min(batchSize, totalTasks - i);

      for (let j = 0; j < remainingTasks; j++) {
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const name = `${prefix} ${subject}`;
        const description =
          Math.random() < 0.3
            ? null
            : `Description de la tâche. Cette tâche nécessite une attention particulière.`;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const timeLogged = Math.floor(Math.random() * 28800); // 0 à 8 heures
        const daysAgo = Math.floor(Math.random() * 90);

        tasks.push({
          name,
          description,
          status,
          timeLogged,
          daysAgo,
        });
      }

      // Insertion en batch
      const values: any[] = [];
      const placeholders: string[] = [];
      let paramIndex = 1;

      tasks.forEach((task, index) => {
        placeholders.push(
          `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${
            paramIndex + 3
          }, $${paramIndex + 4}, NOW() - INTERVAL '${task.daysAgo} days')`
        );
        values.push(
          userId,
          task.name,
          task.description,
          task.status,
          task.timeLogged
        );
        paramIndex += 5;
      });

      await client.query(
        `INSERT INTO tasks (user_id, name, description, status, time_logged, created_at)
         VALUES ${placeholders.join(", ")}`,
        values
      );

      console.log(`  ${i + remainingTasks} / ${totalTasks} tasks created...`);
    }

    // Ajouter quelques tâches avec timer actif
    await client.query(
      `UPDATE tasks
       SET timer_started_at = NOW() - INTERVAL '30 minutes'
       WHERE id IN (SELECT id FROM tasks WHERE user_id = $1 ORDER BY RANDOM() LIMIT 5)`,
      [userId]
    );

    console.log("✓ Seed completed successfully!");
    console.log(`  Total tasks: ${totalTasks}`);
    console.log(`  User: test@example.com / password123`);
  } catch (error) {
    console.error("Error during seed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
