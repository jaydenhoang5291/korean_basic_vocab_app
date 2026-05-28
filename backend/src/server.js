import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { pool } from './db.js';

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

const appConfig = {
  environment: process.env.APP_ENV || 'local',
  version: process.env.APP_VERSION || 'v1.0.0'
};

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      database: 'connected',
      environment: appConfig.environment,
      version: appConfig.version,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: error.message
    });
  }
});

app.get('/api/config', (req, res) => {
  res.json(appConfig);
});

app.get('/api/vocabularies', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT id, korean, romanization, vietnamese_meaning, category, example_sentence, created_at
      FROM vocabularies
      ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.post('/api/vocabularies', async (req, res, next) => {
  try {
    const {
      korean,
      romanization,
      vietnamese_meaning: vietnameseMeaning,
      category,
      example_sentence: exampleSentence
    } = req.body;

    if (!korean || !romanization || !vietnameseMeaning || !category) {
      return res.status(400).json({
        message: 'korean, romanization, vietnamese_meaning and category are required'
      });
    }

    const result = await pool.query(
      `
        INSERT INTO vocabularies (korean, romanization, vietnamese_meaning, category, example_sentence)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, korean, romanization, vietnamese_meaning, category, example_sentence, created_at
      `,
      [korean.trim(), romanization.trim(), vietnameseMeaning.trim(), category.trim(), exampleSentence?.trim() || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/vocabularies/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM vocabularies WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Vocabulary not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get('/api/quiz', async (req, res, next) => {
  try {
    const countResult = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM vocabularies
      WHERE category IN (
        SELECT category
        FROM vocabularies
        GROUP BY category
        HAVING COUNT(*) >= 4
      )
    `);
    const total = countResult.rows[0].count;

    if (total === 0) {
      return res.status(400).json({ message: 'At least 4 vocabularies in the same category are required to generate a quiz' });
    }

    const questionResult = await pool.query(`
      SELECT id, korean, romanization, vietnamese_meaning, category, example_sentence
      FROM vocabularies
      WHERE category IN (
        SELECT category
        FROM vocabularies
        GROUP BY category
        HAVING COUNT(*) >= 4
      )
      ORDER BY RANDOM()
      LIMIT 1
    `);
    const question = questionResult.rows[0];

    const wrongAnswersResult = await pool.query(
      `
        SELECT vietnamese_meaning
        FROM vocabularies
        WHERE id <> $1
          AND category = $2
        ORDER BY RANDOM()
        LIMIT 3
      `,
      [question.id, question.category]
    );

    const options = shuffle([
      { text: question.vietnamese_meaning, isCorrect: true },
      ...wrongAnswersResult.rows.map((row) => ({ text: row.vietnamese_meaning, isCorrect: false }))
    ]);

    res.json({
      question: {
        id: question.id,
        korean: question.korean,
        romanization: question.romanization,
        category: question.category,
        example_sentence: question.example_sentence
      },
      options
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

function shuffle(items) {
  return items
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

app.listen(port, () => {
  console.log(`Korean vocab backend running on port ${port}`);
});
