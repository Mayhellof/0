document.addEventListener('DOMContentLoaded', () => {
  const noteInput = document.getElementById('note-input');
  const saveBtn = document.getElementById('save-btn');
  const notesList = document.getElementById('notes-list');

  // 加载已有的笔记
  loadNotes();

  // 保存笔记
  saveBtn.addEventListener('click', () => {
    const noteText = noteInput.value.trim();
    if (noteText !== '') {
      const notes = getNotesFromStorage();
      notes.push(noteText);
      localStorage.setItem('notes', JSON.stringify(notes));
      noteInput.value = '';
      displayNote(noteText);
    }
  });
  document.getElementById('clear-btn').addEventListener('click', () => {
    if (confirm('确定要清空所有笔记吗？')) {
      localStorage.removeItem('notes');
      notesList.innerHTML = '';
    }
  });

  function getNotesFromStorage() {
    return JSON.parse(localStorage.getItem('notes')) || [];
  }

  function loadNotes() {
    const notes = getNotesFromStorage();
    notes.forEach(note => displayNote(note));
  }
  function displayNote(note) {
    const li = document.createElement('li');
    li.textContent = note;

    // 删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '❌';
    deleteBtn.classList.add('delete-btn');

    // 编辑按钮
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.classList.add('edit-btn');

    // 删除功能
    deleteBtn.addEventListener('click', () => {
      const notes = getNotesFromStorage().filter(n => n !== note);
      localStorage.setItem('notes', JSON.stringify(notes));
      notesList.removeChild(li);
    });

    // 编辑功能
    editBtn.addEventListener('click', () => {
      const newNote = prompt('编辑你的笔记：', li.textContent.replace('❌', '').replace('✏️', '').trim());
      if (newNote && newNote.trim() !== '') {
        const notes = getNotesFromStorage();
        const index = notes.indexOf(note);
        notes[index] = newNote;
        localStorage.setItem('notes', JSON.stringify(notes));
        li.textContent = newNote;
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
      }
    });

    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    notesList.appendChild(li);
  }
  // 字体切换功能
  document.getElementById('font-select').addEventListener('change', function () {
    const selectedFont = this.value;
    document.querySelectorAll('#note-input, #notes-list li').forEach(element => {
      element.style.fontFamily = selectedFont;
    });
  });
})
