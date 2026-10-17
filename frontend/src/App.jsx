import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

const EMPTY_STATS = { livros: 0, livrosDisponiveis: 0, emprestimosAtivos: 0, emprestimosDevolvidos: 0, notificacoesNaoLidas: 0 };
const dateTime = (value) => value ? new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.erro || `Erro ${response.status} na comunicação com a API.`);
  return data;
}


/* eslint-disable-next-line no-unused-vars */
function StatCard({ label, value, note, icon }) {
  return <article className="stat-card"><div className="stat-top"><span>{label}</span><span className="stat-icon">{icon}</span></div><strong>{value}</strong><small>{note}</small></article>;
}

function App() {
  const [connected, setConnected] = useState(false);
  const [socketMessage, setSocketMessage] = useState("Conectando aos eventos em tempo real…");
  const [stats, setStats] = useState(EMPTY_STATS);
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loans, setLoans] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [lastEvent, setLastEvent] = useState("Aguardando evento do servidor");
  const selectedBookRef = useRef("");
  const selectedStudentRef = useRef("");

  const loadPanel = useCallback(async () => {
    try {
      const result = await api("/emprestimos?pagina=1&limite=50");
      const [bookResult, studentResult, notificationResult] = await Promise.all([
        api("/livros?pagina=1&limite=50"), api("/estudantes?pagina=1&limite=50"), api("/notificacoes?pagina=1&limite=50"),
      ]);
      setLoans(result.dados || []);
      setBooks(bookResult.dados || []);
      setStudents(studentResult.dados || []);
      setNotifications(notificationResult.dados || []);
      if (!selectedBookRef.current && (bookResult.dados || []).length) {
        const firstAvailable = bookResult.dados.find((book) => book.disponivel);
        if (firstAvailable) { selectedBookRef.current = String(firstAvailable.id); setSelectedBook(String(firstAvailable.id)); }
      }
      if (!selectedStudentRef.current && (studentResult.dados || []).length) {
        selectedStudentRef.current = String(studentResult.dados[0].id);
        setSelectedStudent(String(studentResult.dados[0].id));
      }
      setError("");
    } catch (err) {
      setError(err.message || "Não foi possível carregar os dados da biblioteca.");
    } finally { setLoading(false); }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const [bookResult, activeLoans, returnedLoans, notificationCount] = await Promise.all([
        api("/livros?pagina=1&limite=50"),
        api("/emprestimos?devolvido=false&pagina=1&limite=1"),
        api("/emprestimos?devolvido=true&pagina=1&limite=1"),
        api("/notificacoes/nao-lidas/total"),
      ]);
      const allBooks = bookResult.dados || [];
      setStats({
        livros: bookResult.total ?? allBooks.length,
        livrosDisponiveis: allBooks.filter((book) => book.disponivel).length,
        emprestimosAtivos: activeLoans.total ?? 0,
        emprestimosDevolvidos: returnedLoans.total ?? 0,
        notificacoesNaoLidas: notificationCount.total ?? 0,
      });
    } catch { /* The visible error is handled by loadPanel. */ }
  }, []);

  useEffect(() => {
    const socket = io({
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 700,
      timeout: 8000,
    });
    const onConnect = () => {
      setConnected(true);
      setSocketMessage("Conectado · sincronizando estado");
      socket.emit("sala:entrar", { sala: "emprestimos" });
      socket.emit("sala:entrar", { sala: "notificacoes" });
      socket.emit("painel:solicitar", {});
      socket.emit("notificacoes:sincronizar", { limite: 50 });
      loadPanel();
    };
    const onDisconnect = () => { setConnected(false); setSocketMessage("Conexão perdida · tentando reconectar…"); };
    const onPanel = (data) => setStats(data);
    const refreshEvent = (label) => () => { setLastEvent(label); setSocketMessage(`Tempo real ativo · ${label}`); loadPanel(); socket.emit("painel:solicitar", {}); };
    const onNewNotification = (notification) => {
      setLastEvent(notification?.titulo || "Nova notificação");
      setSocketMessage("Nova notificação recebida em tempo real");
      loadPanel(); socket.emit("painel:solicitar", {});
    };
    const onSocketError = (payload) => setError(payload?.erro || "Erro na comunicação em tempo real.");
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", () => { setConnected(false); setSocketMessage("Servidor indisponível · tentando reconectar…"); });
    socket.on("conexao:estado", () => setConnected(true));
    socket.on("painel:atualizado", onPanel);
    socket.on("emprestimo:criado", refreshEvent("Novo empréstimo"));
    socket.on("emprestimo:devolvido", refreshEvent("Devolução registrada"));
    socket.on("livro:disponibilidade", refreshEvent("Disponibilidade de livro alterada"));
    socket.on("notificacao:nova", onNewNotification);
    socket.on("notificacao:lida", refreshEvent("Notificação marcada como lida"));
    socket.on("notificacao:lidas-todas", refreshEvent("Notificações atualizadas"));
    socket.on("socket:erro", onSocketError);
    return () => { socket.removeAllListeners(); socket.disconnect(); };
  // Keep one Socket.IO connection while refresh callbacks update.
  // loadPanel is stable because initial selections are tracked with refs.
  }, [loadPanel]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const filteredLoans = useMemo(() => {
    const q = filter.trim().toLocaleLowerCase("pt-BR");
    return loans.filter((loan) => {
      const matchesStatus = statusFilter === "todos" || (statusFilter === "ativos" ? !loan.devolvido : loan.devolvido);
      const matchesQuery = !q || `${loan.livro?.titulo || ""} ${loan.estudante?.nome || ""}`.toLocaleLowerCase("pt-BR").includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [loans, filter, statusFilter]);

  async function createLoan(event) {
    event.preventDefault(); setError(""); setNotice(""); setSaving(true);
    try {
      await api("/emprestimos", { method: "POST", body: JSON.stringify({ livroId: Number(selectedBook), estudanteId: Number(selectedStudent) }) });
      setNotice("Empréstimo registrado. Os clientes conectados recebem o evento em tempo real.");
      setLastEvent("Empréstimo registrado");
      await loadPanel(); await loadStats();
    } catch (err) { setError(err.message || "Não foi possível registrar o empréstimo."); }
    finally { setSaving(false); }
  }

  async function returnLoan(id) {
    setError(""); setNotice("");
    try {
      await api(`/emprestimos/${id}/devolver`, { method: "PUT" });
      setNotice("Devolução registrada e comunicada aos clientes conectados.");
      await loadPanel(); await loadStats();
    } catch (err) { setError(err.message || "Não foi possível registrar a devolução."); }
  }

  async function markRead(id) {
    setError("");
    try { await api(`/notificacoes/${id}/lida`, { method: "PUT" }); await loadPanel(); await loadStats(); }
    catch (err) { setError(err.message || "Não foi possível marcar a notificação como lida."); }
  }

  async function markAllRead() {
    setError("");
    try { await api("/notificacoes/lidas", { method: "PUT" }); await loadPanel(); await loadStats(); }
    catch (err) { setError(err.message || "Não foi possível atualizar as notificações."); }
  }

  return <div className="app-shell">
    <header className="topbar">
      <a href="#inicio" className="brand"><span className="brand-mark">B</span><span><strong>Biblioteca Viva</strong><small>Gestão em tempo real</small></span></a>
      <div className="topbar-right"><a className="docs-link" href="/docs" target="_blank" rel="noreferrer">Documentação API ↗</a><span className={`connection ${connected ? "online" : "offline"}`}><i />{connected ? "Conectado" : "Reconectando"}</span></div>
    </header>
    <main className="page-content" id="inicio">
      <section className="hero">
        <div><p className="eyebrow">PAINEL DA BIBLIOTECA</p><h1>O que acontece aqui,<br /><span>todo mundo vê na hora.</span></h1><p className="hero-copy">Empréstimos, devoluções e notificações sincronizados entre os clientes conectados.</p><div className={`realtime-note ${connected ? "" : "warning"}`}><span className="pulse-dot" />{socketMessage} · Último evento: {lastEvent}</div></div>
        <div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="book-stack"><span/><span/><span/></div><div className="art-spark spark-one">✦</div><div className="art-spark spark-two">✳</div></div>
      </section>

      {error && <div className="alert error" role="alert"><span>!</span>{error}<button onClick={() => setError("")} aria-label="Fechar erro">×</button></div>}
      {notice && <div className="alert success" role="status"><span>✓</span>{notice}<button onClick={() => setNotice("")} aria-label="Fechar mensagem">×</button></div>}

      <section className="stats-grid" aria-label="Indicadores da biblioteca">
        <StatCard label="Livros cadastrados" value={stats.livros} note="Acervo da biblioteca" icon="▤" />
        <StatCard label="Disponíveis" value={stats.livrosDisponiveis} note="Prontos para empréstimo" icon="✓" />
        <StatCard label="Empréstimos ativos" value={stats.emprestimosAtivos} note="Aguardando devolução" icon="↗" />
        <StatCard label="Não lidas" value={stats.notificacoesNaoLidas} note="Notificações pendentes" icon="◉" />
      </section>

      <div className="content-grid">
        <section className="panel loan-panel">
          <div className="panel-heading"><div><p className="eyebrow">AÇÃO RÁPIDA</p><h2>Novo empréstimo</h2></div><span className="panel-number">01</span></div>
          <p className="panel-description">Ao confirmar, o status do livro e os indicadores serão sincronizados via Socket.IO.</p>
          <form className="loan-form" onSubmit={createLoan}>
            <label>Livro disponível<select value={selectedBook} onChange={(e) => { selectedBookRef.current = e.target.value; setSelectedBook(e.target.value); }} required><option value="" disabled>Selecione um livro</option>{books.filter((book) => book.disponivel).map((book) => <option key={book.id} value={book.id}>{book.titulo}</option>)}</select></label>
            <label>Estudante<select value={selectedStudent} onChange={(e) => { selectedStudentRef.current = e.target.value; setSelectedStudent(e.target.value); }} required><option value="" disabled>Selecione um estudante</option>{students.filter((student) => student.ativo !== false).map((student) => <option key={student.id} value={student.id}>{student.nome}</option>)}</select></label>
            <button className="primary-button" disabled={saving || !selectedBook || !selectedStudent}>{saving ? "Registrando…" : "Registrar empréstimo"}<span>→</span></button>
          </form>
          <div className="hint"><span>↯</span><p><strong>Atualização automática</strong><br />Abra esta página em duas abas para demonstrar os eventos ao vivo.</p></div>
        </section>

        <section className="panel notification-panel">
          <div className="panel-heading"><div><p className="eyebrow">CENTRAL DE ALERTAS</p><h2>Notificações <span className="count-pill">{notifications.filter((n) => !n.lida).length}</span></h2></div><button className="text-button" onClick={markAllRead} disabled={!notifications.some((n) => !n.lida)}>Marcar todas como lidas</button></div>
          <div className="notification-list">
            {notifications.slice(0, 6).map((item) => <article key={item.id} className={`notification-item ${item.lida ? "read" : "unread"}`}>
              <span className={`notification-symbol ${item.tipo === "EMPRESTIMO_DEVOLVIDO" ? "green" : "blue"}`}>{item.tipo === "EMPRESTIMO_DEVOLVIDO" ? "✓" : "↗"}</span>
              <div className="notification-body"><div className="notification-title-row"><strong>{item.titulo}</strong>{!item.lida && <span className="unread-dot" />}</div><p>{item.mensagem}</p><small>{dateTime(item.createdAt)}</small></div>
              {!item.lida && <button className="read-button" onClick={() => markRead(item.id)} aria-label={`Marcar ${item.titulo} como lida`} title="Marcar como lida">✓</button>}
            </article>)}
            {!notifications.length && <div className="empty-state"><span>◌</span><strong>Nenhuma notificação por enquanto</strong><small>Novos empréstimos e devoluções aparecem aqui.</small></div>}
          </div>
          <div className="panel-footer"><span>Persistidas no banco de dados</span><span><i className="footer-dot" /> Sincronização ao vivo</span></div>
        </section>
      </div>

      <section className="panel loans-panel">
        <div className="panel-heading loans-heading"><div><p className="eyebrow">MOVIMENTAÇÃO</p><h2>Empréstimos recentes</h2><p className="panel-description">A lista muda depois que outro cliente registra um empréstimo ou uma devolução.</p></div><span className="live-tag"><i /> AO VIVO</span></div>
        <div className="table-tools"><div className="search-wrap"><span>⌕</span><input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar por livro ou estudante…" aria-label="Buscar empréstimos" /></div><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filtrar por status"><option value="todos">Todos os status</option><option value="ativos">Ativos</option><option value="devolvidos">Devolvidos</option></select><button className="outline-button" onClick={() => { loadPanel(); loadStats(); }}>↻ Atualizar</button></div>
        <div className="table-scroll"><table><thead><tr><th>Livro</th><th>Estudante</th><th>Empréstimo</th><th>Status</th><th>Ação</th></tr></thead><tbody>
          {filteredLoans.map((loan) => <tr key={loan.id}><td><div className="book-cell"><span className="mini-book">▤</span><div><strong>{loan.livro?.titulo || `Livro ${loan.livroId}`}</strong><small>Empréstimo #{loan.id}</small></div></div></td><td>{loan.estudante?.nome || `Estudante ${loan.estudanteId}`}</td><td>{dateTime(loan.dataEmprestimo)}</td><td><span className={`status-chip ${loan.devolvido ? "returned" : "active"}`}><i />{loan.devolvido ? "Devolvido" : "Ativo"}</span></td><td>{loan.devolvido ? <span className="finished-label">Concluído</span> : <button className="return-button" onClick={() => returnLoan(loan.id)}>Registrar devolução</button>}</td></tr>)}
          {!filteredLoans.length && <tr><td colSpan="5"><div className="table-empty">{loading ? "Carregando dados…" : "Nenhum empréstimo encontrado para esse filtro."}</div></td></tr>}
        </tbody></table></div>
        <div className="panel-footer"><span>Exibindo {filteredLoans.length} de {loans.length} registros carregados</span><span>Busca por título e estudante</span></div>
      </section>

      <footer className="page-footer"><div><span className="footer-brand-mark">B</span><span><strong>Biblioteca Viva</strong><small>API REST · Prisma ORM · Socket.IO · React</small></span></div><p>UFRB · Desenvolvimento de Software II · Trabalho 4</p></footer>
    </main>
  </div>;
}

export default App;
