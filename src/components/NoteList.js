import { gsap } from 'gsap';

export class NoteList extends HTMLElement {
    constructor() {
        super();
        this.notes = [];
    }

    connectedCallback() {
        this.addEventListener('noteAdded', (event) => {
            const newNote = event.detail;
            this._notes.push(newNote);
            this.render();
        });
        this.fetchNotesFromAPI();
    }

    set notes(notes) {
        if (!Array.isArray(notes)) {
            console.error('Error: Input data is not an array');
            return;
        }
        this._notes = notes;
        this.render();
    }

    render() {
        this.innerHTML = '';
        this._notes.forEach((note) => {
            const noteItem = document.createElement('div');
            noteItem.classList.add('note-item');
            noteItem.innerHTML = `
                <div class="note-content">
                    <h3>${note.title}</h3>
                    <p>${note.body}</p>
                </div>
                <div class="note-footer">
                    <button class="delete-button"><span class="delete-icon">🗑️</span>Delete</button>
                    <button class="archive-button">${note.archived ? 'Unarchive This Note' : 'Archive This Note'}<span class="archived-icon">${note.archived ? '📁' : '📎'}</span></button>
                </div>
            `;

            const deleteButton = noteItem.querySelector('.delete-button');
            deleteButton.addEventListener('click', () => {
                this.showConfirmationDialog(note.id);
            });

            const archiveButton = noteItem.querySelector('.archive-button');
            archiveButton.addEventListener('click', () => {
                if (note.archived) {
                    this.unarchiveNoteFromAPI(note.id);
                    gsap.from(archiveButton, {
                        scale: 1.2,
                        duration: 0.5,
                        ease: 'bounce',
                    });
                } else {
                    this.archiveNoteFromAPI(note.id);
                    gsap.from(archiveButton, {
                        scale: 1.2,
                        duration: 0.5,
                        ease: 'bounce',
                    });
                }
            });

            this.appendChild(noteItem);
        });
    }

    async fetchNotesFromAPI() {
        try {
            const [archivedResponse, unarchivedResponse] = await Promise.all([
                fetch('https://notes-api.dicoding.dev/v2/notes/archived'),
                fetch('https://notes-api.dicoding.dev/v2/notes'),
            ]);

            if (!archivedResponse.ok || !unarchivedResponse.ok) {
                throw new Error('Failed to fetch notes from API');
            }

            const archivedData = await archivedResponse.json();
            const unarchivedData = await unarchivedResponse.json();

            const allNotesData = [...archivedData.data, ...unarchivedData.data];

            this.notes = allNotesData;
        } catch (error) {
            console.error('Error fetching notes from API:', error.message);
        }
    }

    async deleteNoteFromAPI(noteId) {
        try {
            const response = await fetch(
                `https://notes-api.dicoding.dev/v2/notes/${noteId}`,
                {
                    method: 'DELETE',
                },
            );
            if (!response.ok) {
                throw new Error('Failed to delete note from API');
            }
            const data = await response.json();
            console.log(data.message);

            this.closeConfirmationDialog();

            this._notes = this._notes.filter((note) => note.id !== noteId);

            await this.fetchNotesFromAPI();
        } catch (error) {
            console.error('Error deleting note from API:', error.message);
        }
    }

    async archiveNoteFromAPI(noteId) {
        try {
            const response = await fetch(
                `https://notes-api.dicoding.dev/v2/notes/${noteId}/archive`,
                {
                    method: 'POST',
                },
            );
            if (!response.ok) {
                throw new Error('Failed to archive note from API');
            }
            const data = await response.json();
            console.log(data.message);
            await this.fetchNotesFromAPI();
        } catch (error) {
            console.error('Error archiving note from API:', error.message);
        }
    }

    async unarchiveNoteFromAPI(noteId) {
        try {
            const response = await fetch(
                `https://notes-api.dicoding.dev/v2/notes/${noteId}/unarchive`,
                {
                    method: 'POST',
                },
            );
            if (!response.ok) {
                throw new Error('Failed to unarchive note from API');
            }
            const data = await response.json();
            console.log(data.message);
            await this.fetchNotesFromAPI();
        } catch (error) {
            console.error('Error unarchiving note from API:', error.message);
        }
    }

    showConfirmationDialog(noteId) {
        const confirmationDialog = document.createElement(
            'confirmation-dialog',
        );
        confirmationDialog.addEventListener('confirmed', () =>
            this.deleteNoteFromAPI(noteId),
        );
        confirmationDialog.addEventListener('canceled', () =>
            this.closeConfirmationDialog(),
        );
        document.body.appendChild(confirmationDialog);
    }

    closeConfirmationDialog() {
        const confirmationDialog = document.querySelector(
            'confirmation-dialog',
        );
        confirmationDialog.parentNode.removeChild(confirmationDialog);
    }
}
