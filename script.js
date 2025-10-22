const STORAGE_KEY = 'todo_tasks_ana';

const inputTask = document.getElementById('inputTask');
const btnAdd = document.getElementById('btnAdd');
const listEl = document.getElementById('list');
const summary = document.getElementById('summary');

const filterAll = document.getElementById('filterAll');
const filterActive = document.getElementById('filterActive');
const filterCompleted = document.getElementById('filterCompleted');
const search = document.getElementById('search');

const modalBack = document.getElementById('modalBack');
const editInput = document.getElementById('editInput');
const modalSave = document.getElementById('modalSave');
const modalCancel = document.getElementById('modalCancel');

let tasks = loadTasks();
let filter = 'all';
let editingId = null;

render();

// listar eventos
btnAdd.addEventListener('click', onAdd);
inputTask.addEventListener('keydown', e => { if (e.key === 'Enter') onAdd(); });
filterAll.addEventListener('click', () => setFilter('all'));
filterActive.addEventListener('click', () => setFilter('active'));
filterCompleted.addEventListener('click', () => setFilter('completed'));
search.addEventListener('input', render);
modalCancel.addEventListener('click', closeModal);
modalSave.addEventListener('click', saveEdit);

// funções
function onAdd() {
  const text = inputTask.value.trim();
  if (!text) return;
  const task = { id: cryptoRandomId(), text, done: false, createdAt: Date.now() };
  tasks.unshift(task);
  saveTasks();
  inputTask.value = '';
  render();
}

function cryptoRandomId() {
  return 'id_' + Math.random().toString(36).slice(2, 9);
}

function setFilter(next) {
  filter = next;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  if (filter === 'all') filterAll.classList.add('active');
  if (filter === 'active') filterActive.classList.add('active');
  if (filter === 'completed') filterCompleted.classList.add('active');
  render();
}

function render() {
  const q = (search.value || '').toLowerCase();
  listEl.innerHTML = '';
  const visible = tasks.filter(t => {
    if (filter === 'active' && t.done) return false;
    if (filter === 'completed' && !t.done) return false;
    if (q && !t.text.toLowerCase().includes(q)) return false;
    return true;
  });

  if (visible.length === 0) {
    listEl.innerHTML = '<div class="small" style="padding:14px;border-radius:8px;background:rgba(255,255,255,0.02)">Nenhuma tarefa encontrada.</div>';
  } else {
    visible.forEach(t => {
      const div = document.createElement('div');
      div.className = 'task';

      const left = document.createElement('div');
      left.className = 'task-left';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = t.done;
      cb.addEventListener('change', () => toggleDone(t.id));

      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = t.text;
      if (t.done) title.classList.add('completed');

      left.appendChild(cb);
      left.appendChild(title);

      const icons = document.createElement('div');
      icons.className = 'icons';

      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn';
      editBtn.title = 'Editar';
      editBtn.innerHTML = '✏️';
      editBtn.addEventListener('click', () => openEdit(t.id));

      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn';
      delBtn.title = 'Excluir';
      delBtn.innerHTML = '🗑️';
      delBtn.addEventListener('click', () => deleteTask(t.id));

      icons.appendChild(editBtn);
      icons.appendChild(delBtn);

      div.appendChild(left);
      div.appendChild(icons);

      listEl.appendChild(div);
    });
  }

  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  summary.textContent = `${done} de ${total} tarefas concluídas`;
}

function toggleDone(id) {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  tasks[idx].done = !tasks[idx].done;
  saveTasks();
  render();
}

function deleteTask(id) {
  if (!confirm('Deseja realmente excluir esta tarefa?')) return;
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function openEdit(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  editingId = id;
  editInput.value = t.text;
  modalBack.style.display = 'flex';
  editInput.focus();
}

function closeModal() {
  editingId = null;
  modalBack.style.display = 'none';
}

function saveEdit() {
  const newText = editInput.value.trim();
  if (!newText) return alert('Texto vazio');
  const idx = tasks.findIndex(t => t.id === editingId);
  if (idx === -1) return closeModal();
  tasks[idx].text = newText;
  tasks[idx].updatedAt = Date.now();
  saveTasks();
  closeModal();
  render();
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : sampleTasks();
  } catch (e) {
    return [];
  }
}

function sampleTasks() {
  return [
    { id: cryptoRandomId(), text: 'Programar', done: false, createdAt: Date.now() },
    { id: cryptoRandomId(), text: 'Fazer tarefas da faculdade', done: false, createdAt: Date.now() - 3600000 },
    { id: cryptoRandomId(), text: 'Estudar idiomas', done: true, createdAt: Date.now() - 7200000 }
  ];
}