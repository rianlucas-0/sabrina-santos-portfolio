const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'Método não permitido' });

  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (b._honey) return res.status(200).json({ ok: true }); // robô: finge sucesso

  const nome = String(b.Nome || '').trim().slice(0, 120);
  const email = String(b.email || '').trim().slice(0, 160);
  const tel = String(b.Telefone || '').trim().slice(0, 40);
  const assunto = String(b.Assunto || '').trim().slice(0, 120);
  const msg = String(b.Mensagem || '').trim().slice(0, 5000);

  if (!nome || !msg || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ ok: false, message: 'Dados inválidos' });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ ok: false, message: 'RESEND_API_KEY não configurada' });

  const html = `<h2>Novo contato pelo site</h2>
<p><b>Nome:</b> ${esc(nome)}</p><p><b>E-mail:</b> ${esc(email)}</p>
<p><b>Telefone:</b> ${esc(tel) || '-'}</p><p><b>Assunto:</b> ${esc(assunto) || '-'}</p>
<p><b>Mensagem:</b><br>${esc(msg).replace(/\n/g, '<br>')}</p>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || 'Site Sabrina Santos <onboarding@resend.dev>',
        to: [process.env.CONTACT_TO || 'sabrina.csds@gmail.com'],
        reply_to: email,
        subject: `Novo contato: ${assunto || 'Site'} - ${nome}`,
        html
      })
    });
    if (!r.ok) {
      console.error('Resend error', r.status, await r.text());
      return res.status(502).json({ ok: false, message: 'Falha ao enviar e-mail' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Erro interno' });
  }
};
