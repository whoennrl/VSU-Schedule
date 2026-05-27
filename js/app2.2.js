/*
 * ВГУ Расписание | Version [build_version]
 * Build: [build_info]
 * Developer: @whoennrl
 * 
 * Site: https://whoennrl.ru
 */

window.mode = 'local' // ! "production" or "local"
window.backUpdate = false;
window.reserv = false;



function logFun(funName) {
    console.log("[Start function]", funName)
}



async function checkSubcscription(id) {
    logFun("checkSubcscription")


    if (reserv) return { "status": "RU Node - Reserv" }
    return { "status": "ok" }
    try {
        let r = await fetch("https://vsu-bot-check.aurum.whoennrl.ru/api/check_subscription", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: id })
        })
        let a = await r.json();
        return a
    } catch {
        return { "status": "Check Error" }
    }



}



function showScreen(screenName) {
    logFun("showScreen")

    if (["settings", "admin", 'premium', "create-profile", "devmode"].includes(screenName)) {
        window.Telegram.WebApp.BackButton.show()
        window.Telegram.WebApp.BackButton.onClick(() => {

            if (["settings"].includes(screenName)) {
                if (localStorage.getItem("profile" + localStorage.getItem("current_profile") + "mode") == "student") {
                    if (document.querySelector(".screen[screen-id='settings'] #settings_faculty").value != localStorage.getItem("profile" + localStorage.getItem("current_profile") + "faculty") || document.querySelector(".screen[screen-id='settings'] #settings_group").value != localStorage.getItem("profile" + localStorage.getItem("current_profile") + "group")) {
                        if (document.querySelector("#settings_group").value == '0') {
                            alert("Надо выбрать группу!")
                        } else {
                            localStorage.setItem("profile" + localStorage.getItem("current_profile") + "faculty", document.querySelector(".screen[screen-id='settings'] #settings_faculty").value);
                            localStorage.setItem("profile" + localStorage.getItem("current_profile") + "group", document.querySelector(".screen[screen-id='settings'] #settings_group").value);
                            document.location.reload();
                        }
                    } else {
                        showScreen("homeboard")
                    }
                } else {
                    showScreen("homeboard")
                }


            } else {
                showScreen("homeboard")
            }


        })
    } else {
        window.Telegram.WebApp.BackButton.hide();
    }



    let bl = document.querySelectorAll(".screen[screen-id]");
    bl.forEach(e => {
        if (!e.classList.contains('hidden')) {
            e.classList.toggle("hidden")
        }
    })
    try {
        let b1 = document.querySelector(".screen[screen-id='" + screenName + "']")
        b1.classList.toggle("hidden")
    } catch {
        console.log("Экран не найден")
    }
}

window.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".screen[screen-id='critical-error'] *[action='reload']").addEventListener("click", () => {
        document.location.reload()
    })
    document.querySelector(".screen[screen-id='critical-error'] *[action='clear-data']").addEventListener("click", () => {
        localStorage.clear();
        document.location.reload()
    })
    try {
        conLoaded()
    } catch {
        showScreen('critical-error')
        window.Telegram.WebApp.SettingsButton.hide()
        window.Telegram.WebApp.BackButton.hide()

        if (localStorage.getItem("dev_mode") == "true") {
            showScreen("devmode")
        }

    }
})






async function conLoaded() {
    logFun("conLoaded")

    if (window.backUpdate) {
        showScreen("techUpdate");
        return;
    }


    if (['ios', 'android'].includes(window.Telegram.WebApp.platform)) {
        window.Telegram.WebApp.requestFullscreen()
        document.body.setAttribute("platform", "mobile")
    } else {
        document.body.setAttribute("platform", "desktop")
    }

    window.Telegram.WebApp.disableVerticalSwipes();

    //let data =  checkSubcscription(window.Telegram.WebApp.initDataUnsafe.user.id)
    //if (data.status == "not_subscribed") {
    //    showScreen("subscription")
    //    return
    //}


    if (window.mode == "production") {
        if (window.reserv) {
            window.ScheduleAPI.init("https://ru-node.whoennrl.ru/index.php")
        } else {
            window.ScheduleAPI.init('https://aurum.whoennrl.ru/api/shedule-v2/index.php');
        }
    } else if (window.mode == "local") {
        if (window.reserv) {
            window.ScheduleAPI.init("https://ru-node.whoennrl.ru/local.php");
        } else {
            window.ScheduleAPI.init('https://aurum.whoennrl.ru/api/shedule-v2/local.php');
        }
    } else {
        alert("Режим работы не определен, запуск приостановлен")
        return
    }

    window.ScheduleAPI.analytics(window.Telegram.WebApp.platform, window.Telegram.WebApp.version)

    let banned_status;
    try {
        banned_status = await window.ScheduleAPI.getBanStatus(window.Telegram.WebApp.initDataUnsafe.user.id);
    } catch {
        console.log("NOT SUPPORTED!")
        showScreen("unsupported");
        return
    }


    if (banned_status.banned) {
        console.log("Аккаунт заблокирован");
        showScreen("account-banned")
    } else {
        console.log("Аккаунт активен")

        // установка данных
        document.querySelector(".screen[screen-id='install-step-1'] .bottom .box .userBox .userText .name span").innerHTML = window.Telegram.WebApp.initDataUnsafe.user.first_name + " " + window.Telegram.WebApp.initDataUnsafe.user.last_name;
        document.querySelector(".screen[screen-id='install-step-1'] .bottom .box .userBox .userText .username").innerHTML = "@" + window.Telegram.WebApp.initDataUnsafe.user.username;
        if (document.querySelector(".screen[screen-id='install-step-1'] .bottom .box .userBox .userText .username").innerHTML == "@") {
            document.querySelector(".screen[screen-id='install-step-1'] .bottom .box .userBox .userText .username").style.display = 'none'
        } else {
            document.querySelector(".screen[screen-id='install-step-1'] .bottom .box .userBox .userText .username").style.display = 'block'
        }
        let img = document.querySelector(".screen[screen-id='install-step-1'] .bottom .box .userBox .userPic");
        img.style.background = 'url(' + window.Telegram.WebApp.initDataUnsafe.user.photo_url + ')';
        img.style.backgroundSize = "cover";

        if (window.Telegram.WebApp.initDataUnsafe.user.is_premium) {
            document.querySelector(".screen[screen-id='install-step-1'] .bottom .userBox .userText .premium").style.display = "block"
        } else {
            document.querySelector(".screen[screen-id='install-step-1'] .bottom .userBox .userText .premium").style.display = "none"
        }

        document.querySelector("#faculty-install-step-2").addEventListener("selectChanged", async (e) => {

            let groups = await window.ScheduleAPI.getGroups(e.target.value);
            let html = "<option value='0' selected disabled>Выберите</option>"
            groups.forEach(o => {
                html += "<option value='{value}'>{value}</option>".replaceAll("{value}", o.name)
            })

            document.querySelector("#group-install-step-2").innerHTML = html;

        })

        window.ScheduleAPI.getTeachers().then(e => {
            window.teachers = []
            e.forEach(op => {
                window.teachers.push(op.teacher)
            })
        }).catch(e => console.log("error", e))


        document.querySelector("#mode-install-step-2").addEventListener("selectChanged", async (e) => {

            // проверяем режим
            let mode = e.target.value;



            let allDmod = document.querySelectorAll(".screen[screen-id='install-step-2'] *[dmode]");

            if (mode == "student") {
                allDmod.forEach(e => {
                    if (e.getAttribute("dmode") != "student") {
                        e.classList.add("hidden")
                    } else {
                        e.classList.remove("hidden")
                    }
                })
            } else {
                allDmod.forEach(e => {
                    if (e.getAttribute("dmode") != "teacher") {
                        e.classList.add("hidden")
                    } else {
                        e.classList.remove("hidden")
                    }
                })
            }

        })


        // получение статуса установки
        let install_status = localStorage.getItem("install-step");

        if (install_status == null || install_status == "step-1") {
            showScreen("install-step-1");
            localStorage.setItem("current_theme", "system")

            document.querySelector(".screen[screen-id='install-step-1'] .bottom .button").addEventListener("click", () => {
                showScreen("install-step-2")

            })
        } else {
            let mode = localStorage.getItem("profile" + localStorage.getItem("current_profile") + "mode");
            if (mode == 'student') {

                showScreen("homeboard");
                initHome();

            } else if (mode == "teacher") {

                showScreen("homeboard");
                initHome();

            } else {
                localStorage.setItem("install-step", 'step-1')
                document.location.reload();
            }
        }

        document.querySelector(".screen[screen-id='install-step-2'] .bottom .button").addEventListener("click", async () => {

            let faculty = document.querySelector("#faculty-install-step-2").value;
            let group = document.querySelector("#group-install-step-2").value;
            let mode = document.querySelector("#mode-install-step-2").value;
            let teacher = document.querySelector("#teacher-install-step-2").value;



            if (mode == "student") {
                if (faculty == "0") return;
                if (group == "0") return;
                localStorage.setItem("current_profile", "default")
                localStorage.setItem("install-step", 'installed');
                localStorage.setItem("profiledefaultmode", 'student');
                localStorage.setItem("profiledefaultfaculty", faculty);
                localStorage.setItem('profiledefaultgroup', group);
                localStorage.setItem("profiledefaultname", "По умолчанию");
                localStorage.setItem("current_profile_id", "0");

                document.location.reload();
            } else {
                if (teacher == "0") return;

                if (!window.teachers.includes(teacher)) {
                    alert("Преподаватель не найден")
                } else {
                    localStorage.setItem("current_profile", "default")
                    localStorage.setItem("profiledefaultmode", 'teacher');
                    localStorage.setItem("profiledefaultteacher", teacher);
                    localStorage.setItem("install-step", 'installed');
                    localStorage.setItem("profiledefaultname", "По умолчанию");
                    localStorage.setItem("current_profile_id", "0");

                    document.location.reload();
                }


            }

        })

    }

    let menu_home = document.querySelectorAll(".screen[screen-id='homeboard'] .bottom .bottomMenu .item");
    menu_home.forEach(e => {
        e.addEventListener("click", () => {
            menu_home.forEach(o => {
                o.classList.remove("selected")
            })
            e.classList.add('selected');
            let parts = document.querySelectorAll(".screen[screen-id='homeboard'] .screen-part");
            parts.forEach(o => {
                if (!o.classList.contains('hidden')) {
                    o.classList.add("hidden")
                }
            })
            let part = document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='" + e.getAttribute('part') + "']")
            part.classList.remove('hidden')
        })
    })





}


async function initHome() {
    logFun("initHome")

    let selectors = document.querySelectorAll(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .daySelector .item");

    let home = document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home']");

    let pointerStart = 0;
    let anPoinLs = 0;
    let anPoinSt = 0;

    function handleAn(e) {

        let olddnum = dnum;
        let swipes_set = localStorage.getItem("set_swipes");
        if (swipes_set == null) return;
        if (swipes_set == "false") return;

        if (e.type == "touchstart") {
            anPoinSt = e.touches[0].screenX;

        }
        if (e.type == "touchmove") {
            anPoinLs = e.touches[0].screenX;
        }
        if (e.type == "touchend") {
            anPoinMv = false;

            if (anPoinSt + 150 < anPoinLs) {
                dnum -= 1;
                if (dnum < 0) {
                    dnum = 5;
                }
                document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .sheduleBlock").scrollTo(0, 0)
            }
            if (anPoinSt - 150 > anPoinLs) {
                dnum += 1;
                if (dnum > 5) {
                    dnum = 0
                }
                document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .sheduleBlock").scrollTo(0, 0)
            }

            if (olddnum == dnum) return

            selectors.forEach(o => {
                if (o.classList.contains('selected')) { o.classList.remove("selected") }
            })
            document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .daySelector .item[dnum='" + dnum + "']").classList.add("selected");
            let html = parseDay(shedule[0][dnum]);
            document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .sheduleBlock").innerHTML = html;
            updateLesson();

            try {
                if (localStorage.getItem("profile" + localStorage.getItem("current_profile") + "mode") == "student") {
                    document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .subtitle").innerHTML = shedule[0][dnum][0].date;
                } else {
                    document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .subtitle").innerHTML = shedule[0][dnum][0].date + " | " + localStorage.getItem("profile" + localStorage.getItem("current_profile") + "teacher");
                }
            } catch {
                document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .subtitle").innerHTML = "...";
            }

        }


    }







    function handlerClick(e) {
        let swipes_set = localStorage.getItem("set_swipes");
        if (swipes_set == null) return;
        if (swipes_set == "false") return;

        if (['mousedown', 'touchstart'].includes(e.type)) {
            pointerStart = e.pageX;

        }
        let olddnum = dnum;
        if (['mouseup', 'touchend'].includes(e.type)) {
            if (pointerStart + 150 < e.pageX) {
                dnum -= 1;
                if (dnum < 0) {
                    dnum = 5;
                }
                document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .sheduleBlock").scrollTo(0, 0)
            }
            if (pointerStart - 150 > e.pageX) {
                dnum += 1;
                if (dnum > 5) {
                    dnum = 0
                }
                document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .sheduleBlock").scrollTo(0, 0)
            }
            if (olddnum == dnum) return

            selectors.forEach(o => {
                if (o.classList.contains('selected')) { o.classList.remove("selected") }
            })
            document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .daySelector .item[dnum='" + dnum + "']").classList.add("selected");
            let html = parseDay(shedule[0][dnum]);
            document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .sheduleBlock").innerHTML = html;
            updateLesson()
            try {
                if (localStorage.getItem("profile" + localStorage.getItem("current_profile") + "mode") == "student") {
                    document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .subtitle").innerHTML = shedule[0][dnum][0].date;
                } else {
                    document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .subtitle").innerHTML = shedule[0][dnum][0].date + " | " + localStorage.getItem("profile" + localStorage.getItem("current_profile") + "teacher");
                }
            } catch {
                document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .subtitle").innerHTML = "...";
            }
        }
    }



    function parseDay(data) {
        logFun("parseDay")
        function generateBox(d) {
            let html = "";
            let types = "";
            let color = ""
            let maximus = ""
            let subject = d.subject;
            if (d.subject.includes("(Лек)")) {
                types = "лекция";
                color = "#007AFF"
                subject = d.subject.replace("(Лек)", "")
            } else if (d.subject.includes("(Лаб)")) {
                types = "лабораторная работа";
                color = "#34C759"
                subject = d.subject.replace("(Лаб)", "")
            } else if (d.subject.includes("(ПЗ)")) {
                types = "практическое занятие";
                color = "#FFCC00";
                subject = d.subject.replace("(ПЗ)", "")
            } else if (d.subject.includes("(Лек (off))")) {
                types = "офлайн лекция";
                color = "rgb(203, 48, 224)";
                subject = d.subject.replace("(Лек (off))", "")
            } else if (d.subject.includes("(Нет пары)")) {
                types = "";
                color = "#ff3535";
                subject = d.subject.replace("(Нет пары)", "")
            } else if (d.subject.includes("(Конс)")) {
                types = "Консультация"
                color = "rgb(255, 141, 40)"
                subject = d.subject.replace("(Конс)", "")
                maximus = "maximus"
            } else if (d.subject.includes("(Зач)")) {
                types = "Зачет"
                color = "rgb(0, 122, 255)"
                subject = d.subject.replace("(Зач)", "")
                maximus = "maximus"
            } else if (d.subject.includes("(Экз)")) {
                types = "Экзамен"
                color = "#ff3535"
                subject = d.subject.replace("(Экз)", "")
                maximus = "maximus"
            } else if (d.subject.includes("(Куср)")) {
                types = "Управляемая самостоятельная работа"
                color = "rgb(97, 85, 245)"
                subject = d.subject.replace("(Куср)", "")
                maximus = "maximus"
            }

            else {
                subject = d.subject;
                color = "#f0f0f0";
            }


            if (maximus != "") {
                html += "<div class='shedule-box " + maximus + "' style='background: [color] !important; color: white !important;' id='shedule-[id]' hash='[hash]'>".replace("[hash]", d.hash).replace("[id]", d.id);
            } else {
                html += "<div class='shedule-box " + maximus + "' id='shedule-[id]' hash='[hash]'>".replace("[hash]", d.hash).replace("[id]", d.id);
            }


            html += "<div class='line' style='display: [max]; background: [color];' custom-color='[color]'></div>"
            if (maximus != "") {
                html = html.replaceAll("[max]", "none")
                html = html.replaceAll("[color]", color)
            } else {
                html = html.replaceAll("[max]", "block")
                html = html.replaceAll("[color]", color)
            }

            html += "<div class='block'>"
            if (types != "") { html += "<div class='top' style='color: [color];' custom-color='[color]'>[type]</div>".replace("[type]", types) }

            if (maximus != "") {
                html = html.replaceAll("[color]", "white")
            } else {
                html = html.replaceAll("[color]", color)
            }

            html += "<div class='middle'>"

            html += "<div class='lesson'>"

            html += "<div class='name'>" + subject + "</div>"

            html += "<div class='classroom'>" + d.classroom + "</div>"
            if (d.is_combined && localStorage.getItem("profile" + localStorage.getItem("current_profile") + "mode") == "student") {
                html += "<div class='combined'>"
                //html += "<span>Совместно:</span>"
                d.combined_main_groups.forEach(o => {
                    html += "<div class='group'>" + o + "</div>"
                })
                html += "</div>"
            } else if (localStorage.getItem("profile" + localStorage.getItem("current_profile") + "mode") == "teacher") {
                html += "<div class='combined'>"
                //html += "<span>Группы:</span>"
                d.combined_with.forEach(o => {
                    html += "<div class='group'>" + o + "</div>"
                })
                html += "</div>"
            }

            html += "</div>"
            html += "<div class='time'>"
            html += "<div class='start' custom-color='{color}'>".replace("{color}", color) + d.time.replace("(", "").replace(")", "").split("-")[0] + "</div>"
            html += "<div class='end'>" + d.time.replace("(", "").replace(")", "").split("-")[1] + "</div>"
            html += "</div>"
            html += "</div>"
            if (d.teacher != "" && localStorage.getItem("profile" + localStorage.getItem("current_profile") + "mode") == "student" && localStorage.getItem("set_prepods") == "true") {
                html += "<div class='bottom-box'>"
                html += "<div class='teacher-picture' style='width: 25px; height: 25px; background: [teacher-pick] no-repeat; background-size: cover; background-position: top; border-radius: 100%;'></div>"
                html += "<div class='teacher'>" + d.teacher + "</div>"
                html += "</div>"
            }
            html += "<div class='end_row'></div>"

            if (d.teacher_photo == null) {
                html = html.replace("[teacher-pick]", "url(./imgs/user.png)")
            } else {
                html = html.replace("[teacher-pick]", "url(" + d.teacher_photo + ")")
            }



            html += "</div>"
            html += "</div>"
            return html;
        }
        let html = ""

        let pairs = {}
        let pairMax = 0

        data.forEach(e => {
            pairs[e.number] = e;
            if (e.number >= pairMax) {
                pairMax = e.number
            }
        })
        let times = [
            "08:00-09:25",
            "09:35-11:00",
            "11:30-12:55",
            "13:05-14:30",
            "14:40-16:05",
            "16:35-18:00",
            "18:10-19:35",
            "19:45-21:10"
        ]

        for (let i = 1; i < pairMax + 1; i++) {
            if (pairs[i] == undefined) {
                pairs[i] = {
                    subject: "Пара №i отсутствует (Нет пары)".replace("i", i),
                    hash: "none_" + Math.floor(Math.random() * (999999999 - 111111111) + 111111111).toString(),
                    classroom: "",
                    is_combined: false,
                    combined_with: [],
                    combined_main_groups: [],
                    time: times[i - 1],
                    teacher: ""
                }
            }

            html += generateBox(pairs[i])
        }

        return html;
    }

    function updateLesson() {

        let current_lesson_set = localStorage.getItem("set_current_lesson");

        function format_time(timee, ltime) {
            let st = "";
            let time = timee - ltime;

            let hours = Math.floor(time / 60 / 60);
            let minutes = Math.floor(time / 60) - hours * 60
            let seconds = Math.floor(time) - hours * 60 * 60 - minutes * 60

            if (hours != 0) {
                st += "0" + hours + ":"
            }
            if (minutes != 0) {
                if (minutes.toString().length == 1) {
                    st += "0"
                }
                st += minutes + ":"
                if (seconds.toString().length == 1) {
                    st += "0"
                }
                st += seconds

            } else {
                st = seconds + " с."
            }


            return st;
        }

        let date = new Date;
        let day = date.getDate();
        let month = date.getMonth();

        let monts = ['января', "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]

        let st = day + " " + monts[month] + " " + date.getFullYear() + " г."


        let bs1 = document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .subtitle")

        if (bs1.innerHTML.includes(st) && localStorage.getItem("set_current_lesson") == "true") {
            let bls = document.querySelectorAll(".shedule-box");

            if (typeof window.currentLesson == "undefined") {
                window.currentLesson = null;
            }
            let ltime = date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds();


            bls.forEach(e => {
                let times = e.querySelector(".time .start").innerHTML;
                let timee = e.querySelector(".time .end").innerHTML;
                times = Number(times.split(":")[0]) * 60 * 60 + Number(times.split(":")[1]) * 60
                timee = Number(timee.split(":")[0]) * 60 * 60 + Number(timee.split(":")[1]) * 60
                if (ltime >= times && ltime <= timee) {
                    window.currentLesson = e;
                }
            })

            try {
                let times = window.currentLesson.querySelector(".time .start").innerHTML;
                let timee = window.currentLesson.querySelector(".time .end").innerHTML;
                times = Number(times.split(":")[0]) * 60 * 60 + Number(times.split(":")[1]) * 60
                timee = Number(timee.split(":")[0]) * 60 * 60 + Number(timee.split(":")[1]) * 60
                if (ltime >= times && ltime <= timee) {
                    window.currentLesson.querySelector(".end_row").innerHTML = "Закончится через: " + format_time(timee, ltime)
                    window.currentLesson.classList.add("current")
                } else {

                    window.currentLesson.classList.remove("current");
                    window.currentLesson.removeChild(window.currentLesson.querySelector("canvas"))
                    window.currentLesson = null;

                }

                if (window.currentLesson.getAttribute("initEffect") == null || typeof window.currentLesson.getAttribute("initEffect") == "undefined") {
                    window.currentLesson.setAttribute("initEffect", "1");
                    PlasmaWave.apply(window.currentLesson, { color: window.currentLesson.querySelector("*[custom-color]").getAttribute("custom-color"), bgColor: 'black', speed: 1, intensity: 2, fps: 40 });
                    window.currentLesson.querySelector("canvas").style.zIndex = "-1"
                    window.currentLesson.querySelector("canvas").style.borderRadius = "30px"
                }

            } catch {}
            


        } else {
            if (typeof window.currentLesson != "undefined" || window.currentLesson != null) {
                try {
                    window.currentLesson.classList.remove("current");
                    window.currentLesson.removeChild(window.currentLesson.querySelector("canvas"))
                    window.currentLesson = null;
                } catch { }
            }

        }
    }


    async function getWeek() {
        logFun("getWeek")
        let shedule
        if (localStorage.getItem("profile" + localStorage.getItem("current_profile") + "mode") == "student") {
            shedule = (await window.ScheduleAPI.getWeek(localStorage.getItem("profile" + localStorage.getItem("current_profile") + "faculty"), localStorage.getItem("profile" + localStorage.getItem("current_profile") + 'group')));
        } else {
            shedule = {};
            shedule.schedule = (await window.ScheduleAPI.getTeacherSchedule(localStorage.getItem("profile" + localStorage.getItem("current_profile") + "teacher")))
        }
        let days1 = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
        let days = [[], [], [], [], [], []];
        let today = [];
        let lastD = new Date();
        let last = "";
        let month = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
        last += lastD.getDate() + " ";
        last += month[lastD.getMonth()] + " ";
        last += lastD.getFullYear() + " г."
        let dnum = -1
        shedule.schedule.forEach(e => {
            days[days1.indexOf(e.day)].push(e);
            if (e.date == last) {
                today.push(e);
                dnum = days1.indexOf(e.day)
            }
        })

        if (dnum == -1) {
            let cou = -1;
            days.forEach(e => {
                cou += 1;
                if (e.length != 0 && dnum == -1) {
                    dnum = cou;
                }
            })
        }

        days.forEach(o => {
            let dImp = false;
            let day = ""
            o.forEach(i => {
                if (i.subject.includes("Куср") || i.subject.includes("Экз") || i.subject.includes("Конс") || i.subject.includes("Зач")) {
                    dImp = true;
                    day = i.day
                }
            })
            let ds = {
                "Понедельник": "0",
                "Вторник": "1",
                "Среда": "2",
                "Четверг": "3",
                "Пятница": "4",
                "Суббота": "5"
            }
            if (dImp) {
                let block = document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .daySelector .item[dnum='" + ds[day] + "']")
                block.style.outline = "2px solid #ff3535"
                block.style.outlineOffset = "-2px"
            }

        })

        return [days, dnum];
    }

    window.ScheduleAPI.checkAdmin().then((data) => {
        let is_admin = data.is_admin
        if (is_admin) {
            document.querySelector("*[action='goto-admin']").addEventListener("click", () => {
                showScreen("admin")
            })
            document.querySelector("*[action='goto-admin']").classList.remove("hidden")
            document.querySelector(".screen[screen-id='admin'] .header .backButton").addEventListener("click", () => {
                showScreen("homeboard")
            })
        }
        window.is_admin = is_admin;

    }).catch(e => { console.log("error", e) })




    updateLesson()
    setInterval(updateLesson, 100)

    let dnum = 0;
    let shedule

    getWeek().then(e => {
        shedule = e

        dnum = shedule[1]
        let today = shedule[0][dnum];
        if (dnum != -1) {
            let html = parseDay(today);

            document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .sheduleBlock").innerHTML = html;
            updateLesson()


            if (localStorage.getItem("profile" + localStorage.getItem("current_profile") + "mode") == "student") {
                document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .subtitle").innerHTML = shedule[0][dnum][0].date;
            } else {
                document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .subtitle").innerHTML = shedule[0][dnum][0].date + " | " + localStorage.getItem("profile" + localStorage.getItem("current_profile") + "teacher");
            }

            document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] *[dnum='{dnum}']".replace("{dnum}", dnum)).classList.add("selected");
            document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .sheduleBlock").scrollTo(0, 0)

            selectors.forEach(e => {
                e.addEventListener("click", () => {

                    selectors.forEach(o => {
                        if (o.classList.contains('selected')) { o.classList.remove("selected") }
                    })
                    e.classList.add("selected");
                    dnum = Number(e.getAttribute('dnum'))
                    let html = parseDay(shedule[0][dnum]);
                    document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .sheduleBlock").innerHTML = html;
                    updateLesson()
                    document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .sheduleBlock").scrollTo(0, 0)
                    try {
                        if (localStorage.getItem("profile" + localStorage.getItem("current_profile") + "mode") == "student") {
                            document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .subtitle").innerHTML = shedule[0][dnum][0].date;
                        } else {
                            document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .subtitle").innerHTML = shedule[0][dnum][0].date + " | " + localStorage.getItem("profile" + localStorage.getItem("current_profile") + "teacher");
                        }
                    } catch {
                        document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .subtitle").innerHTML = "...";
                    }
                })
            })



        } else {
            // нет расписания

            document.querySelector(".screen[screen-id='homeboard'] .daySelector").style.display = 'none'
            let lastD = new Date();
            let last = "";
            let month = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
            last += lastD.getDate() + " ";
            last += month[lastD.getMonth()] + " ";
            last += lastD.getFullYear() + " г."

            document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .subtitle").innerHTML = last

            let html = "<div class='shedule-box'>";
            html += "<div class='line' style='background: [color];'></div>".replace("[color]", "rgba(255, 56, 60, 1)")


            html += "<div class='block'>"

            let types = ""
            let fac = {
                "Математики и информационных технологий": "ФМиИТ",
                "Педагогический": "ПФ",
                "Юридический": "ЮФ",
                "Гуманитарного знания и коммуникаций": "ФГЗиК",
                "Социальной педагогики и психологии": "ФСПиП",
                "Физической культуры и спорта": "ФФКиС",
                "Химико-биологических и географических наук": "ФХБиГН",
                "Художественно-графический": "ХГФ"
            }
            if (localStorage.getItem("profile" + localStorage.getItem("current_profile") + "mode") == "student") {
                types = fac[localStorage.getItem("profile" + localStorage.getItem("current_profile") + "faculty")] + " | " + localStorage.getItem("profile" + localStorage.getItem("current_profile") + "group")
            } else {
                types = localStorage.getItem("profile" + localStorage.getItem("current_profile") + "teacher")
            }

            html += "<div class='middle'>"
            html += "<div class='lesson'>"
            html += "<div class='top' style='color: [color];'>[type]</div>".replace("[color]", "rgba(255, 56, 60, 1)").replace("[type]", types)
            html += "<div class='name'>В базе данных нет пар!</div>"

            html += "<div class='classroom'>Попробуйте зайти в расписание позже</div>"
            html += "</div>"
            html += "</div>"




            html += "</div>"

            document.querySelector(".screen[screen-id='homeboard'] .screen-part[part-id='home'] .sheduleBlock").innerHTML = html;
        }

    }).catch(e => console.log("error", e))




    document.querySelector("*[action='goto-settings']").addEventListener("click", () => {
        showScreen("settings")
    })
    document.querySelector("*[action='goto-tg']").addEventListener("click", () => {
        window.Telegram.WebApp.openTelegramLink("https://t.me/vsu_shedule");
    })


    document.querySelector("*[action='goto-help']").addEventListener("click", () => {
        window.Telegram.WebApp.openTelegramLink("https://t.me/tribute/app?startapp=i1k2");
    })



    init2_1();

    if (['android'].includes(window.Telegram.WebApp.platform)) {
        home.addEventListener("touchstart", handleAn)
        home.addEventListener("mousedown", handlerClick)
        home.addEventListener("touchend", handleAn)
        home.addEventListener("touchmove", handleAn)
        home.addEventListener("mouseup", handleAn)
    } else {
        home.addEventListener("touchstart", handlerClick)
        home.addEventListener("mousedown", handlerClick)
        home.addEventListener("touchend", handlerClick)
        home.addEventListener("mouseup", handlerClick)
    }





}