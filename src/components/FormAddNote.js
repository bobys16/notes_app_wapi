import Swal from 'sweetalert2';

export class FormAddNote extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
      <form class="form-add-note">
        <input id="titleInput" type="text" placeholder="Enter Title" required>
        <div id="titleError" class="error-message"></div>
        <textarea id="bodyInput" placeholder="Enter Note" required></textarea>
        <div id="bodyError" class="error-message"></div>
        <button type="submit">Add Note</button>
      </form>
    `;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = this.querySelector('form');
        form.addEventListener('submit', this.onSubmit.bind(this));
    }

    async onSubmit(event) {
        event.preventDefault();

        const titleInput = this.querySelector('#titleInput');
        const bodyInput = this.querySelector('#bodyInput');
        const title = titleInput.value.trim();
        const body = bodyInput.value.trim();

        try {
            const response = await fetch(
                'https://notes-api.dicoding.dev/v2/notes',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title, body }),
                },
            );

            if (!response.ok) {
                throw new Error('Failed to create note');
            }

            const newNoteResponse = await response.json();
            const newNote = newNoteResponse.data;

            this.dispatchEvent(
                new CustomEvent('noteAdded', { detail: newNote }),
            );

            console.log('New note added:', newNote);

            Swal.fire({
                icon: 'success',
                title: 'Note Created!',
                text: 'Your note has been successfully created.',
            });

            titleInput.value = '';
            bodyInput.value = '';

            this.fetchNotesFromAPI();
        } catch (error) {
            console.error('Error creating note:', error);
        }
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

            this.dispatchEvent(
                new CustomEvent('notesFetched', { detail: allNotesData }),
            );
        } catch (error) {
            console.error('Error fetching notes from API:', error.message);
        }
    }
}

customElements.define('form-add-note', FormAddNote);
