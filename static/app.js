class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button')
        }

        this.state = false;
        this.messages = [];
    }

    display() {
        const { openButton, chatBox, sendButton } = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox));

        sendButton.addEventListener('click', () => this.onSendButton(chatBox));

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({ key }) => {
            if (key === "Enter") {
                this.onSendButton(chatBox);
            }
        });
    }

    toggleState(chatbox) {
        this.state = !this.state;

        if (this.state) {
            chatbox.classList.add('chatbox--active');
        } else {
            chatbox.classList.remove('chatbox--active');
        }
    }

    onSendButton(chatbox, message) {
        if (!message) {
            var textField = chatbox.querySelector('input');
            message = textField.value;
            if (message === "") {
                return;
            }
            textField.value = '';
        }

        let userMessage = { name: "Kullanıcı", message: message };
        this.messages.push(userMessage);
        this.updateChatText(chatbox);
        let neoThinkingMessage = { name: "Neo", message: "  ...  " };
        this.messages.push(neoThinkingMessage);
        this.updateChatText(chatbox);

        fetch('/predict', {
            method: 'POST',
            body: JSON.stringify({ message: message }),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(r => r.json())
            .then(r => {
                setTimeout(() => {
                    this.messages.pop();
                    let neoMessage = { name: "Neo", message: r.answer };
                    this.messages.push(neoMessage);
                    this.updateChatText(chatbox);
                }, 2000);
            })
            .catch((error) => {
                console.error('Hata:', error);
            });
    }

    updateChatText(chatbox) {
        var html = '';
        this.messages.slice().reverse().forEach(function (item, index) {
            if (item.name === "Neo") {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>';
            } else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>';
            }
        });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;

        chatmessage.scrollTop = chatmessage.scrollHeight;
    }

    integrateSpeechRecognition() {
        const recordButton = document.getElementById("recordButton");
        const transcriptionOutput = document.getElementById("transcription");
        const micImage = document.getElementById("micImage");
        const inputField = this.args.chatBox.querySelector('input');

        let recognition;
        let isRecording = false;
        let interimTranscription = '';

        try {
            recognition = new webkitSpeechRecognition();
        } catch (e) {
            console.error("Web Speech API desteklenmiyor.");
            return;
        }

        recognition.lang = "tr-TR";
        recognition.interimResults = true;

        recordButton.addEventListener("click", () => {
            if (!isRecording) {
                recognition.start();
                micImage.src = "/static/mic2.png";
                isRecording = true;

                // Gönder düğmesini devre dışı bırak
                this.args.sendButton.disabled = true;
            } else {
                recognition.stop();

                // Gönder düğmesini etkinleştir
                this.args.sendButton.disabled = false;

                micImage.src = "/static/mic1.png";
                isRecording = false;

                // Transkripsiyon boş değilse gönder
                if (interimTranscription.trim() !== '') {
                    this.onSendButton(this.args.chatBox, interimTranscription);
                }

                // interimTranscription'ı sıfırla
                interimTranscription = '';
            }
        });

        recognition.onresult = (event) => {
            const last = event.results.length - 1;
            interimTranscription = event.results[last][0].transcript;

            // Güncellenen kısım: Söylenenler input alanına yazılsın
             //inputField.value = interimTranscription;

             // Burada ses tanıma sonuçları geldiğinde de gönderme işlemi yapabiliriz.
             // Ancak, bu işlemi sadece bir tıklama yapıldığında yapmalıyız, aksi takdirde her
            // sonuçta otomatik olarak gönderme işlemi yapılacaktır.
            if (!isRecording) {
                return; // Eğer aktif olarak kaydedilmiyorsa hiçbir şey yapma
            }

            if (event.results[last].isFinal) {
                // Sadece sonuçlar tamamlandığında, yani tam bir cümle söylendiğinde gönder
                this.onSendButton(this.args.chatBox, interimTranscription);
                inputField.value = ''; // Gönderdikten sonra input alanını temizle
                interimTranscription = ''; // interimTranscription'ı sıfırla
            }
        };


        recognition.onerror = (event) => {
            console.error("Ses tanıma hatası:", event.error);
        };

        recognition.onend = () => {
            // Tanıma tamamen bittiğinde gönder düğmesini etkinleştir
            this.args.sendButton.disabled = false;

            micImage.src = "/static/mic1.png";
            isRecording = false;
        };
    }
}

const chatbox = new Chatbox();
chatbox.display();
chatbox.integrateSpeechRecognition();