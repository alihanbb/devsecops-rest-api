const { v4: uuidv4 } = require("uuid");
const { query } = require("../../db/postgres");

const TASK_SELECT_FIELDS = `
  id,
  title,
  description,
  completed,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

class TaskRepository {
  async list() {
    const result = await query(`SELECT ${TASK_SELECT_FIELDS} FROM tasks ORDER BY created_at DESC`);
    return result.rows;
  }

  async findById(id) {
    const result = await query(`SELECT ${TASK_SELECT_FIELDS} FROM tasks WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  async create(payload) {
    const result = await query(
      `
        INSERT INTO tasks (id, title, description, completed)
        VALUES ($1, $2, $3, $4)
        RETURNING ${TASK_SELECT_FIELDS}
      `,
      [uuidv4(), payload.title, payload.description || "", payload.completed || false],
    );

    return result.rows[0];
  }

  async update(id, payload) {
    const result = await query(
      `
        UPDATE tasks
        SET title = $2,
            description = $3,
            completed = $4,
            updated_at = NOW()
        WHERE id = $1
        RETURNING ${TASK_SELECT_FIELDS}
      `,
      [id, payload.title, payload.description, payload.completed],
    );

    return result.rows[0] || null;
  }

  async delete(id) {
    const result = await query("DELETE FROM tasks WHERE id = $1", [id]);
    return result.rowCount > 0;
  }
}

module.exports = { TaskRepository };
