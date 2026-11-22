// MatrizPlay - API do ranking (Cloudflare Workers + MongoDB Atlas)
//   GET    /api/ranking  -> lista [{name,hits,time,n}]
//   POST   /api/ranking  -> {name,hits,time}  guarda a MELHOR tentativa do apelido
//   DELETE /api/ranking  -> zera (exige o cabeçalho x-admin-key = ADMIN_KEY)
import { MongoClient } from 'mongodb';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/ranking') return new Response('Não encontrado', { status: 404 });
    if (!['GET', 'POST', 'DELETE'].includes(request.method))
      return json({ error: 'método não permitido' }, 405);

    // Checagens que não precisam do banco
    let name, hits, time;
    if (request.method === 'POST') {
      const b = await request.json().catch(() => null);
      name = b && typeof b.name === 'string' ? b.name.trim().slice(0, 24) : '';
      hits = b ? b.hits : NaN;
      time = b ? b.time : NaN;
      if (!name || !Number.isInteger(hits) || hits < 0 || hits > 20 || !Number.isInteger(time) || time < 0 || time > 86400)
        return json({ error: 'dados inválidos' }, 400);
    }
    if (request.method === 'DELETE') {
      const key = env.ADMIN_KEY;
      if (!key || request.headers.get('x-admin-key') !== key) return json({ error: 'senha incorreta' }, 403);
    }

    let client;
    try {
      client = new MongoClient(env.MONGODB_URI, { maxPoolSize: 1 });
      await client.connect();
      const c = client.db('matrizplay').collection('ranking');

      if (request.method === 'GET') {
        const rows = await c.find({}, { projection: { _id: 0, name: 1, hits: 1, time: 1, n: 1 } }).limit(500).toArray();
        return json(rows);
      }

      if (request.method === 'POST') {
        const _id = name.toLowerCase().replace(/\s+/g, ' ');
        const old = await c.findOne({ _id });
        const better = !old || hits > old.hits || (hits === old.hits && time < old.time);
        const upd = { $inc: { n: 1 } };
        if (better) upd.$set = { name, hits, time, t: Date.now() };
        await c.updateOne({ _id }, upd, { upsert: true });
        return json({ ok: true, best: better });
      }

      await c.deleteMany({}); // DELETE (senha já conferida acima)
      return json({ ok: true });
    } catch (e) {
      console.error(e);
      return json({ error: 'erro no servidor' }, 500);
    } finally {
      if (client) await client.close().catch(() => {});
    }
  },
};
