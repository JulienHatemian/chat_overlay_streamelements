const chat = document.querySelector('#chat');

window.addEventListener('onEventReceived', function (obj) {
    console.log("ALERTE :", obj);
    const listener = obj.detail.listener;
    const event = obj.detail.event;

    console.log(event)

    if (obj.detail.event.listener === 'widget-button') {

        if (obj.detail.event.field === 'testMessage') {
            let emulated = new CustomEvent("onEventReceived", {
                detail: {
                    listener: "message",
                    event: {
                        service: "twitch",
                        data: {
                            time: Date.now(),
                            tags: {
                                "badge-info": "",
                                badges: "moderator/1,partner/1,artist/1",
                                color: "#5B99FF",
                                "display-name": "StreamElements",
                                emotes: "25:46-50",
                                flags: "",
                                id: "43285909-412c-4eee-b80d-89f72ba53142",
                                mod: "1",
                                "room-id": "85827806",
                                subscriber: "0",
                                "tmi-sent-ts": "1579444549265",
                                turbo: "0",
                                "user-id": "100135110",
                                "user-type": "mod"
                            },
                            nick: 'Meit_Ink',
                            userId: "100135110",
                            displayName: 'Meit_Ink',
                            displayColor: "#5B99FF",
                            badges: [{
                                type: "moderator",
                                version: "1",
                                url: "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1",
                                description: "Moderator"
                            }, {
                                type: "partner",
                                version: "1",
                                url: "https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/1",
                                description: "Verified"
                            }],
                            channel: 'Meit_Ink',
                            text: "Howdy! My name is Meit_Ink and I am here to serve Kappa",
                            isAction: !1,
                            emotes: [{
                                type: "twitch",
                                name: "Kappa",
                                id: "25",
                                gif: !1,
                                urls: {
                                    1: "https://static-cdn.jtvnw.net/emoticons/v1/25/1.0",
                                    2: "https://static-cdn.jtvnw.net/emoticons/v1/25/1.0",
                                    4: "https://static-cdn.jtvnw.net/emoticons/v1/25/3.0"
                                },
                                start: 46,
                                end: 50
                            }],
                            msgId: "43285909-412c-4eee-b80d-89f72ba53142"
                        },
                        renderedText: 'Howdy! My name is Meit_Ink and I am here to serve <img src="https://static-cdn.jtvnw.net/emoticons/v1/25/1.0" srcset="https://static-cdn.jtvnw.net/emoticons/v1/25/1.0 1x, https://static-cdn.jtvnw.net/emoticons/v1/25/1.0 2x, https://static-cdn.jtvnw.net/emoticons/v1/25/3.0 4x" title="Kappa" class="emote">'
                    }
                }
            });
            window.dispatchEvent(emulated);
        }
        return;
    }

    // Events
    switch (obj.detail.listener) {
        case "follower-latest":
            const followData = {
                msgId: "follow-" + Date.now(),
                userId: event._id,
                displayName: event.displayName,
                type: "follower"
            }

            const followMessage = `<span class="system">✨ Merci pour le follow <b>${followData.displayName}</b> ! ✨</span>`;

            addMessage(followData, followMessage);
            break;
        case "raid-latest":
            const raidData = {
                msgId: "raid-" + Date.now(),
                userId: event._id,
                displayName: event.displayName,
                viewers: event.amount,
                type: "raid"
            }
            const raidMessage = `<span class="system">🚨 <b>${raidData.displayName}</b> nous a fait un raid de ${raidData.viewers} viewers ! 🚨</span>`;
            addMessage(raidData, raidMessage);
            break;
        case "subscriber-latest":
            const subData = {
                msgId: "sub-" + Date.now(),
                userId: event._id,
                displayName: event.displayName,
                amount: event.amount,
                type: "subscriber"
            }
            const subMessage = `<span class="system">🎉 <b>${subData.displayName}</b> vient de s'abonner pour ${subData.amount} mois ! 🎉</span>`;
            addMessage(subData, subMessage);
            break;
        case "delete-message":
            const msgId = obj.detail.event.msgId;
            document.querySelectorAll(`#message-${msgId}`).forEach(el => {
                el.remove();
            });
            break;
        case "delete-messages":
            const sender = obj.detail.event.userId;
            document.querySelectorAll(`.message[data-sender=${sender}]`).forEach(el => {
                el.remove();
            });
            break;
        case "message":
            let data = obj.detail.event.data;
            // if (data.text.startsWith("!") && hideCommands === "yes") return;
            // if (ignoredUsers.indexOf(data.nick) !== -1) return;
            // let message = attachEmotes(data);
            let badges = "", badge;
            // if (provider === 'mixer') {
            //     data.badges.push({url: data.avatar});
            // }
            // console.log(data);
            for (let i = 0; i < data.badges.length; i++) {
                badge = data.badges[i];
                badges += `<img alt="" src="${badge.url}" class="badge ${badge.type}-icon"> `;
            }

            const message = `<div class="meta">${badges} ${data.displayName}</div><span class="text">${obj.detail.event.renderedText}</span>`;
            // addMessage(data, obj.detail.event.renderedText, badges);
            addMessage(data, message, badges);
            break;
        default:
            console.log("Unknown event: ", obj.detail.listener);
            break;
    }
});

function addMessage(data, messageHTML, badges = "") {
    // const isEvent = ["follower", "raid", "suscriber"].includes(data.type);

    // chat.insertAdjacentHTML('beforeend', /*html*/`
    //     <div class="message" id="message-${data.msgId}" data-sender="${data.userId}">
    //         ${isEvent ? "" : `<div class="meta">${badges} ${data.displayName}</div>`}
    //         <span class="text">${messageHTML}</span>
    //     </div>
    // `);
    chat.insertAdjacentHTML('beforeend', /*html*/`
        <div class="message text" id="message-${data.msgId}" data-sender="${data.userId}">
            ${messageHTML}
        </div>
    `);
}