// const chat = document.querySelector('#chat');

let totalMessages = 0, messagesLimit = 0, nickColor = "user", removeSelector, addition, customNickColor, channelName,
    provider;
let animationIn = 'bounceIn';
let animationOut = 'bounceOut';
let hideAfter = 60;
let hideCommands = "no";
let ignoredUsers = [];
let previousSender = "";
let mergeMessages = false;

// You can personalize the events you want to show in the chat
// The events that are not in the list or define as false for isActive will not be displayed in the chat
let eventList = [
    { libelle: "message", isActive: true },
    { libelle: "delete-message", isActive: true },
    { libelle: "delete-messages", isActive: true },
    { libelle: "follower-latest", isActive: false },
    { libelle: "raid-latest", isActive: false },
    { libelle: "subscriber-latest", isActive: false },
    { libelle: "tip-latest", isActive: false },
    { libelle: "cheer-latest", isActive: false },
    { libelle: "cheer-latest", isActive: false }
];

// Create a Set with the active events
let activeEvents = new Set(
    eventList.filter(event => event.isActive).map(event => event.libelle)
);

window.addEventListener('onEventReceived', function (obj) {
    // console.log("ALERTE :", obj);
    const listener = obj.detail.listener;
    const event = obj.detail.event;

    console.log(listener);
    console.log(event);

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
                                url: "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/3",
                                description: "Moderator"
                            }, {
                                type: "partner",
                                version: "1",
                                url: "https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/3",
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

    //Events
    if(!activeEvents.has(listener)) return;
    console.log("Event Data received:", event.data);
    let eventData = {
        msgId: listener + "-" + Date.now(),
        userId: event._id,
        displayName: event.displayName,
        type: listener.replace("-latest", "")
    };

    switch (listener) {
        case "message":
            let data = event.data;
            if (data.text.startsWith("!") && hideCommands === "yes") break;
            if (ignoredUsers.indexOf(data.nick) !== -1) break;

            let message = attachEmotes(data);
            let badges = "", badge;
            if (provider === 'mixer') {
                data.badges.push({url: data.avatar});
            }
            for (let i = 0; i < data.badges.length; i++) {
                badge = data.badges[i];
                badges += `<img alt="" src="${badge.url}" class="badge ${badge.type}-icon"> `;
            }
            let username = data.displayName + ":";
            if (nickColor === "user") {
                const color = data.displayColor !== "" ? data.displayColor : "#" + (md5(username).slice(26));
                username = `<span style="color:${color}">${username}</span>`;
            }
            else if (nickColor === "custom") {
                const color = customNickColor;
                username = `<span style="color:${color}">${username}</span>`;
            }
            else if (nickColor === "remove") {
                username = '';
            }
            addMessage(username, badges, message, data.isAction, data.userId, data.msgId);
            previousSender = data.userId;

            break
        case "follower-latest":
            const followMessage = `<span class="system">✨ Merci pour le follow <b>${eventData.displayName}</b> ! ✨</span>`;

            // addMessage(followData, followMessage);
            break;
        case "raid-latest":
            Object.assign(eventData, { 
                viewers: event.amount
            });
            const raidMessage = `<span class="system">🚨 <b>${eventData.displayName}</b> nous a fait un raid de ${eventData.viewers} viewers ! 🚨</span>`;
            
            // addMessage(raidData, raidMessage);
            break;
        case "subscriber-latest":
            Object.assign(eventData, {
                amount: event.amount,
                gifted: event.gifted
            });
            let subtext = "";

            if(event.gifted === true){
                subtext += `<span class="system">🎉 <b>${eventData.displayName}</b> a reçu ${eventData.amount} abonnement ! 🎉</span>`
            }else{
                subtext += `<span class="system">🎉 <b>${eventData.displayName}</b> vient de s'abonner pour ${eventData.amount} mois ! 🎉</span>`
            }
            // const subMessage = `<span class="system">🎉 <b>${subData.displayName}</b> vient de s'abonner pour ${subData.amount} mois ! 🎉</span>`;
            // addMessage(subData, subtext);
            break;
        case "delete-message":
            const msgId = event.msgId;
            document.querySelectorAll(`#message-${msgId}`).forEach(el => {
                el.remove();
            });
            break;
        case "delete-messages":
            const sender = event.userId;
            document.querySelectorAll(`.message[data-sender="${sender}"]`).forEach(el => {
                el.remove();
            });
            break;
        default:
            console.log("Unknown event: ", listener);
    }

    // if (obj.detail.listener === "delete-message") {
    //     const msgId = obj.detail.event.msgId;
    //     $(`[data-msgid=${msgId}]`).remove();
    //     return;
    // } else if (obj.detail.listener === "delete-messages") {
    //     const sender = obj.detail.event.userId;
    //     $(`.message-row[data-sender=${sender}]`).remove();
    //     return;
    // }

    // if (obj.detail.listener !== "message") return;
    // let data = obj.detail.event.data;
    // if (data.text.startsWith("!") && hideCommands === "yes") return;
    // if (ignoredUsers.indexOf(data.nick) !== -1) return;
    // let message = attachEmotes(data);
    // let badges = "", badge;
    // if (provider === 'mixer') {
    //     data.badges.push({url: data.avatar});
    // }
    // for (let i = 0; i < data.badges.length; i++) {
    //     badge = data.badges[i];
    //     badges += `<img alt="" src="${badge.url}" class="badge ${badge.type}-icon"> `;
    // }
    // let username = data.displayName + ":";
    // if (nickColor === "user") {
    //     const color = data.displayColor !== "" ? data.displayColor : "#" + (md5(username).slice(26));
    //     username = `<span style="color:${color}">${username}</span>`;
    // }
    // else if (nickColor === "custom") {
    //     const color = customNickColor;
    //     username = `<span style="color:${color}">${username}</span>`;
    // }
    // else if (nickColor === "remove") {
    //     username = '';
    // }
    // addMessage(username, badges, message, data.isAction, data.userId, data.msgId);
    // previousSender = data.userId;
});

window.addEventListener('onWidgetLoad', function (obj) {
    const fieldData = obj.detail.fieldData;
    animationIn = fieldData.animationIn;
    animationOut = fieldData.animationOut;
    hideAfter = fieldData.hideAfter;
    messagesLimit = fieldData.messagesLimit;
    nickColor = fieldData.nickColor;
    customNickColor = fieldData.customNickColor;
    hideCommands = fieldData.hideCommands;
    channelName = obj.detail.channel.username;
    mergeMessages = fieldData.mergeMessages === "yes";
    fetch('https://api.streamelements.com/kappa/v2/channels/' + obj.detail.channel.id + '/').then(response => response.json()).then((profile) => {
        provider = profile.provider;
    });
    if (fieldData.alignMessages === "block") {
        addition = "prepend";
        removeSelector = ".message-row:nth-child(n+" + (messagesLimit + 1) + ")"
    } else {
        addition = "append";
        removeSelector = ".message-row:nth-last-child(n+" + (messagesLimit + 1) + ")"
    }

    ignoredUsers = fieldData.ignoredUsers.toLowerCase().replace(" ", "").split(",");
});

// function addMessage(data, messageHTML, badges = "") {
//     // const isEvent = ["follower", "raid", "suscriber"].includes(data.type);

//     // chat.insertAdjacentHTML('beforeend', /*html*/`
//     //     <div class="message" id="message-${data.msgId}" data-sender="${data.userId}">
//     //         ${isEvent ? "" : `<div class="meta">${badges} ${data.displayName}</div>`}
//     //         <span class="text">${messageHTML}</span>
//     //     </div>
//     // `);
//     chat.insertAdjacentHTML('beforeend', /*html*/`
//         <div class="message text" id="message-${data.msgId}" data-sender="${data.userId}">
//             ${messageHTML}
//         </div>
//     `);
// }




function attachEmotes(message) {
    let text = html_encode(message.text);
    let data = message.emotes;
    if (typeof message.attachment !== "undefined") {
        if (typeof message.attachment.media !== "undefined") {
            if (typeof message.attachment.media.image !== "undefined") {
                text = `${message.text}<img src="${message.attachment.media.image.src}">`;
            }
        }
    }
    return text
        .replace(
            /([^\s]*)/gi,
            function (m, key) {
                let result = data.filter(emote => {
                    return html_encode(emote.name) === key
                });
                if (typeof result[0] !== "undefined") {
                    let url = result[0]['urls'][1];
                    if (provider === "twitch") {
                        return `<img class="emote" " src="${url}"/>`;
                    } else {
                        if (typeof result[0].coords === "undefined") {
                            result[0].coords = {x: 0, y: 0};
                        }
                        let x = parseInt(result[0].coords.x);
                        let y = parseInt(result[0].coords.y);

                        let width = "{emoteSize}px";
                        let height = "auto";

                        if (provider === "mixer") {
                            console.log(result[0]);
                            if (result[0].coords.width) {
                                width = `${result[0].coords.width}px`;
                            }
                            if (result[0].coords.height) {
                                height = `${result[0].coords.height}px`;
                            }
                        }
                        return /*html*/`<div class="emote" style="width: ${width}; height:${height}; display: inline-block; background-image: url(${url}); background-position: -${x}px -${y}px;"></div>`;
                    }
                } else return key;

            }
        );
}

function html_encode(e) {
    return e.replace(/[<>"^]/g, function (e) {
        return "&#" + e.charCodeAt(0) + ";";
    });
}

function addMessage(username, badges = '', message, isAction, uid, msgId) {
    totalMessages += 1;
    let actionClass = "";
    if (isAction) {
        actionClass = "action";
    }
    if (mergeMessages && previousSender === uid) {
        const lastMessage = document.querySelector('.main-container').lastElementChild;
        const messageElement = document.createElement('span');
        messageElement.innerHTML = `&nbsp;${message}`; // Use `messageText` or your actual message content variable here
        messageElement.dataset.sender = uid;
        messageElement.dataset.msgid = msgId;
        lastMessage.querySelector('.user-message').appendChild(messageElement);
        return;
    }
    
    const element = $.parseHTML(/*html*/`
    <div data-sender="${uid}" data-msgid="${msgId}" class="message-row {animationIn} animated" id="msg-${totalMessages}">
        <div class="user-box ${actionClass}">${badges}${username}</div>
        <div class="user-message ${actionClass}">${message}</div>
    </div>`);
    if (addition === "append") {
        if (hideAfter !== 999) {
            $(element).appendTo('.main-container').delay(hideAfter * 1000).queue(function () {
                $(this).removeClass(animationIn).addClass(animationOut).delay(1000).queue(function () {
                    $(this).remove()
                }).dequeue();
            });
        } else {
            $(element).appendTo('.main-container');
        }
    } else {
        if (hideAfter !== 999) {
            $(element).prependTo('.main-container').delay(hideAfter * 1000).queue(function () {
                $(this).removeClass(animationIn).addClass(animationOut).delay(1000).queue(function () {
                    $(this).remove()
                }).dequeue();
            });
        } else {
            $(element).prependTo('.main-container');
        }
    }

    if (totalMessages > messagesLimit) {
        removeRow();
    }
}

function removeRow() {
    if (!$(removeSelector).length) {
        return;
    }
    if (animationOut !== "none" || !$(removeSelector).hasClass(animationOut)) {
        if (hideAfter !== 999) {
            $(removeSelector).dequeue();
        } else {
            $(removeSelector).addClass(animationOut).delay(1000).queue(function () {
                $(this).remove().dequeue()
            });

        }
        return;
    }

    $(removeSelector).animate({
        height: 0,
        opacity: 0
    }, 'slow', function () {
        $(removeSelector).remove();
    });
}