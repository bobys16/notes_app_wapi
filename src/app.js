import './styles/styles.css';
import { NoteList } from './components/NoteList.js';
import { FormAddNote } from './components/FormAddNote.js';
import { CustomNavbar } from './components/Header.js';
import { ConfirmationDialog } from './components/ConfirmationDialog.js';
import { Loader } from './components/Loader.js';
import Swal from 'sweetalert2';
import gsap from 'gsap';

const loader = document.createElement('app-spinner');
document.body.appendChild(loader);
document.addEventListener('DOMContentLoaded', async () => {
    customElements.define('note-list', NoteList);
    customElements.define('custom-navbar', CustomNavbar);
    const loginContainer = document.querySelector('.login-container');

    if (loginContainer) {
        gsap.set(loginContainer, { opacity: 0 });
        gsap.to(loginContainer, {
            opacity: 1,
            duration: 1.5,
            ease: 'power4.out',
            delay: 0.5,
            onComplete: () => {
                loginContainer.classList.add('shine');
            },
        });
        const loginButton = document.querySelector('.btn-login');
        gsap.from(loginButton, {
            opacity: 0,
            x: -50,
            duration: 1,
            ease: 'power4.out',
            delay: 1.5,
        });
        const registerButton = document.querySelector('.btn-register');
        gsap.from(registerButton, {
            opacity: 0,
            x: 50,
            duration: 1,
            ease: 'power4.out',
            delay: 1.5,
        });
    }
    loader.show(3000);
    try {
        loader.show(3000);
        const isLoggedIn = checkLoginStatus();

        if (
            !isLoggedIn &&
            !['/login.html', '/register.html'].includes(
                window.location.pathname,
            )
        ) {
            window.location.href = 'login.html';
            return;
        }

        const [archivedResponse, unarchivedResponse] = await Promise.all([
            fetch('https://notes-api.dicoding.dev/v2/notes/archived'),
            fetch('https://notes-api.dicoding.dev/v2/notes'),
        ]);

        if (!archivedResponse.ok || !unarchivedResponse.ok) {
            throw new Error('Failed to fetch notes');
        }

        const archivedData = await archivedResponse.json();
        const unarchivedData = await unarchivedResponse.json();

        const allNotesData = [...archivedData.data, ...unarchivedData.data];

        const noteList = document.querySelector('note-list');
        noteList.notes = allNotesData;

        let eventListenerAdded = false;
        const formAddNote = document.querySelector('form-add-note');
        if (!eventListenerAdded) {
            formAddNote.addEventListener('noteAdded', async (event) => {
                try {
                    const newNote = event.detail;

                    if (newNote.archived) {
                        archivedData.data.push(newNote);
                    } else {
                        unarchivedData.data.push(newNote);
                    }
                    const [archivedResponse, unarchivedResponse] =
                        await Promise.all([
                            fetch(
                                'https://notes-api.dicoding.dev/v2/notes/archived',
                            ),
                            fetch('https://notes-api.dicoding.dev/v2/notes'),
                        ]);

                    if (!archivedResponse.ok || !unarchivedResponse.ok) {
                        throw new Error('Failed to fetch notes from API');
                    }

                    const rearchivedData = await archivedResponse.json();
                    const reunarchivedData = await unarchivedResponse.json();

                    noteList.notes = [
                        ...rearchivedData.data,
                        ...reunarchivedData.data,
                    ];
                } catch (error) {
                    console.error('Error updating notes:', error.message);
                }
            });
            eventListenerAdded = true;
        }
    } catch (error) {
        console.error('Error fetching notes:', error.message);
    }
});

function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('logged') === 'true';
    return isLoggedIn;
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const username = formData.get('username');
        const password = formData.get('password');

        try {
            loader.show(3000);
            const params = new URLSearchParams();
            params.append('username', username);
            params.append('password', password);

            const response = await fetch('https://solvine.online/API/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params,
            });
            const data = await response.json();
            if (response.ok && data.status == 'success') {
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('logged', 'true');
                Swal.fire({
                    title: 'Redirecting in 3 seconds...',
                    timer: 3000,
                    timerProgressBar: true,
                    willClose: () => {
                        window.location.href = 'index.html';
                    },
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: data.message,
                });
            }
        } catch (error) {
            console.error('Error logging in:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: `Error logging in: ${error.message}`,
            });
        }
    });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(registerForm);
        const username = formData.get('username');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm-password');

        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Registration Failed',
                text: 'Passwords do not match',
            });
            return;
        }

        try {
            loader.show(3000);
            const params = new URLSearchParams();
            params.append('username', username);
            params.append('password', password);

            const response = await fetch(
                'https://solvine.online/API/register',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params,
                },
            );
            const data = await response.json();
            if (response.ok && data.status == 'success') {
                Swal.fire({
                    title: 'Registration Successful',
                    text: 'You have successfully registered.',
                    icon: 'success',
                }).then(() => {
                    window.location.href = 'login.html';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    text: data.message,
                });
            }
        } catch (error) {
            console.error('Error registering:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: `Error registering: ${error.message}`,
            });
        }
    });
}
