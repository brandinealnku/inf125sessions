export class ClassroomSession {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
    });

    const sessionState = async () => (await this.state.storage.get('state')) || {
      step: 0,
      resultsVisible: false,
      status: 'waiting',
      updatedAt: Date.now()
    };

    if (method === 'GET' && url.pathname.endsWith('/snapshot')) {
      const state = await sessionState();
      const participants = (await this.state.storage.get('participants')) || {};
      const answers = (await this.state.storage.get('answers')) || {};
      const cutoff = Date.now() - 120000;
      const active = Object.values(participants).filter(p => p.lastSeen >= cutoff);
      return json({ state, participantCount: active.length, participants: active, answers });
    }

    if (method === 'POST' && url.pathname.endsWith('/join')) {
      const body = await request.json();
      const participants = (await this.state.storage.get('participants')) || {};
      participants[body.device] = {
        device: body.device,
        name: String(body.name || 'Anonymous').slice(0, 40),
        lastSeen: Date.now()
      };
      await this.state.storage.put('participants', participants);
      return json({ ok: true, state: await sessionState() });
    }

    if (method === 'POST' && url.pathname.endsWith('/heartbeat')) {
      const body = await request.json();
      const participants = (await this.state.storage.get('participants')) || {};
      if (participants[body.device]) {
        participants[body.device].lastSeen = Date.now();
        await this.state.storage.put('participants', participants);
      }
      return json({ ok: true });
    }

    if (method === 'POST' && url.pathname.endsWith('/answer')) {
      const body = await request.json();
      const answers = (await this.state.storage.get('answers')) || {};
      const key = String(body.question || '');
      answers[key] ||= {};
      answers[key][body.device] = {
        name: String(body.name || 'Anonymous').slice(0, 40),
        response: body.response,
        updatedAt: Date.now()
      };
      await this.state.storage.put('answers', answers);
      return json({ ok: true });
    }

    if (method === 'POST' && url.pathname.endsWith('/state')) {
      const body = await request.json();
      const current = await sessionState();
      const next = {
        step: Number.isFinite(body.step) ? body.step : current.step,
        resultsVisible: typeof body.resultsVisible === 'boolean' ? body.resultsVisible : current.resultsVisible,
        status: body.status || current.status,
        updatedAt: Date.now()
      };
      await this.state.storage.put('state', next);
      return json(next);
    }

    if (method === 'POST' && url.pathname.endsWith('/reset')) {
      await this.state.storage.deleteAll();
      const initial = { step: 0, resultsVisible: false, status: 'waiting', updatedAt: Date.now() };
      await this.state.storage.put('state', initial);
      return json({ ok: true, state: initial });
    }

    return json({ error: 'Not found' }, 404);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/session/')) {
      const parts = url.pathname.split('/').filter(Boolean);
      const sessionId = parts[2] || 'session-2';
      const id = env.CLASSROOM.idFromName(sessionId);
      const stub = env.CLASSROOM.get(id);
      return stub.fetch(request);
    }
    return env.ASSETS.fetch(request);
  }
};
