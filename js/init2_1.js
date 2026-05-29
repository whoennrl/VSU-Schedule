async function init2_1() {
    init_settings();

    window.ScheduleAPI.checkAdmin().then((data) => {
        init_admin()

    }).catch(e => { console.log("error", e) })


    window.Telegram.WebApp.SettingsButton.show()
    window.Telegram.WebApp.SettingsButton.onClick(() => {
        showScreen("settings")
    })



}

async function checkTheme() {
    let current_theme = document.body.getAttribute("theme");
    if (current_theme == "minion" || current_theme == "glass") {
        localStorage.setItem("set_theme", "system")
        document.body.setAttribute("theme", window.Telegram.WebApp.colorScheme)
    }
    if (current_theme == null) {
        if (localStorage.getItem("set_theme") == "system") {
            document.body.setAttribute("theme", window.Telegram.WebApp.colorScheme)
        } else {
            document.body.setAttribute("theme", localStorage.getItem("set_theme"))
        }
    }

    if (localStorage.getItem("set_theme") == "system") {
        if (document.body.getAttribute("theme") != window.Telegram.WebApp.colorScheme) {
            document.body.setAttribute("theme", window.Telegram.WebApp.colorScheme)
        }
    } else {
        if (document.body.getAttribute("theme") != localStorage.getItem("set_theme")) {
            document.body.setAttribute("theme", localStorage.getItem("set_theme"))
        }
    }


    setTimeout(checkTheme, 100)
}

window.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("set_theme") == null) {
        localStorage.setItem("set_theme", "system")
    }

    try {
        document.querySelector(".screen[screen-id='settings'] #settings_theme").value = localStorage.getItem("set_theme");
    } catch {
        document.querySelector(".screen[screen-id='settings'] #settings_theme").value = "system";
    }
    document.querySelector(".screen[screen-id='settings'] #settings_theme").addEventListener("selectChanged", async (e) => {
        localStorage.setItem("set_theme", e.target.value);
    })

    checkTheme();
})

async function init_settings() {


    function changeSwitch(e) {
        localStorage.setItem(e.target.getAttribute("set"), e.target.checked)
    }


    if (localStorage.getItem("install-step") == 'installed') {

        if (localStorage.getItem("set_swipes") == null) {
            localStorage.setItem("set_swipes", true);
        }
        if (localStorage.getItem("set_current_lesson") == null) {
            localStorage.setItem("set_current_lesson", true);
        }
        if (localStorage.getItem("set_sled_new") == null) {
            localStorage.setItem("set_sled_ned", true)
        }
        if (localStorage.getItem("set_prepods") == null) {
            localStorage.setItem("set_prepods", false)
        }

    }

    if (localStorage.getItem("set_swipes") == "true") {
        document.querySelector(".screen[screen-id='settings'] .set_swipes input").checked = true
    }
    if (localStorage.getItem("set_current_lesson") == "true") {
        document.querySelector(".screen[screen-id='settings'] .set_current_lesson input").checked = true
    }
    if (localStorage.getItem("set_sled_ned") == "true") {
        document.querySelector(".screen[screen-id='settings'] .set_sled_ned input").checked = true
    }
    if (localStorage.getItem("set_prepods") == "true") {
        document.querySelector(".screen[screen-id='settings'] .set_prepods input").checked = true
    }

    let mode = localStorage.getItem("profile" + localStorage.getItem("current_profile") + "mode");

    let dmode = document.querySelectorAll(".screen[screen-id='settings'] *[dmode]");
    dmode.forEach(e => {
        if (e.getAttribute("dmode") != mode) {
            e.classList.add("hidden")
        }
    })

    if (mode == "student") {
        document.querySelector(".screen[screen-id='settings'] #settings_faculty").value = localStorage.getItem("profile" + localStorage.getItem("current_profile") + "faculty");
        updateOptions(document.querySelector(".screen[screen-id='settings'] #settings_faculty"))

        let groups = await window.ScheduleAPI.getGroups(localStorage.getItem("profile" + localStorage.getItem("current_profile") + "faculty"));
        let html = "<option value='0' selected disabled>Выберите</option>"
        groups.forEach(o => {
            html += "<option value='{value}'>{value}</option>".replaceAll("{value}", o.name)
        })

        document.querySelector("#settings_group").innerHTML = html;

        document.querySelector("#settings_group").value = localStorage.getItem("profile" + localStorage.getItem("current_profile") + "group")

        updateOptions(document.querySelector(".screen[screen-id='settings'] #settings_group"))

        document.querySelector("#settings_faculty").addEventListener("selectChanged", async (e) => {
            let groups = await window.ScheduleAPI.getGroups(e.target.value);
            let html = "<option value='0' selected disabled>Выберите</option>"
            groups.forEach(o => {
                html += "<option value='{value}'>{value}</option>".replaceAll("{value}", o.name)
            })

            document.querySelector("#settings_group").innerHTML = html;
        })

    }

    document.querySelector("*[action='clear-dataS']").addEventListener("click", () => {
        localStorage.clear();
        document.location.reload()
    })


    document.querySelector(".screen[screen-id='settings'] .set_swipes input").addEventListener("change", changeSwitch)
    document.querySelector(".screen[screen-id='settings'] .set_current_lesson input").addEventListener("change", changeSwitch)
    document.querySelector(".screen[screen-id='settings'] .set_prepods input").addEventListener("change", changeSwitch)



}



async function init_admin() {


    let devices_info = await window.ScheduleAPI.getPlatformStats();
    //let hour_stats = await window.ScheduleAPI.getHourlyStats();
    let data = {}
    data.backgroundColor = "rgb(28, 28, 30)",
        data.labels = [];
    data.datasets = []
    data.datasets.push({
        label: "Platforms",
        data: []
    })

    let total_users = 0;
    devices_info.forEach(e => {
        data.labels.push(e.platform)
        data.datasets[0].data.push(e.user_count)
    })


    let devices = new Chart(document.querySelector("#chart-devices").getContext("2d"), {
        type: 'bar',
        data: data
    })



    let l = await window.ScheduleAPI.getAllUsers();
    total_users = l.length;
    document.querySelector("*[dataset='all_users']").innerHTML = total_users

    function generateUserBox(data) {
        let html = "";
        html += "<div class='user' search-string='[first_name] [last_name] [username] [user_id]' user-id='[user_id]'>"
        html += "<div class='left'>"
        html += "<div class='name'>[first_name] [last_name]</div>"
        if (data.username != null) {
            html += "<div class='username'>@[username]</div>"
        }
        html += "<div class='last_seen'>[last_seen]</div>"
        html += "<div class='userid'>[user_id]</div>"
        html += "</div>"
        html += "<div class='right'>"
        if (data.is_banned) {
            html += "<div class='button-mini unban' uid='[user_id]'>Разблокировать</div>"
        } else {
            html += "<div class='button-mini ban' uid='[user_id]'>Заблокировать</div>"
        }


        html += "</div>"
        html += "</div>"

        html = html.replaceAll("[first_name]", data.first_name)
        html = html.replaceAll("[last_name]", data.last_name)
        html = html.replaceAll("[username]", data.username)
        html = html.replaceAll("[user_id]", data.user_id)
        html = html.replaceAll("[last_seen]", data.last_seen)
        return html
    }
    let html = ""
    l.forEach(user => {
        html += generateUserBox(user)
    })

    setInterval(function () {
        let search = document.querySelector("#users_search").value;
        if (search != "") {
            search = search.replaceAll(" ", "");
            let bl = document.querySelectorAll(".screen[screen-id='admin'] .allUsers .user");
            bl.forEach(e => {
                e.classList.remove("hidden");
                if (!e.getAttribute("search-string").includes(search)) {
                    e.classList.add("hidden")
                }
            })
        } else {
            let bl = document.querySelectorAll(".screen[screen-id='admin'] .allUsers .user");
            bl.forEach(e => {
                e.classList.remove("hidden")
            })
        }
    }, 100)



    document.querySelector(".screen[screen-id='admin'] .content .allUsers").innerHTML = html;

    let bl = document.querySelectorAll(".screen[screen-id='admin'] .allUsers .user .button-mini");
    bl.forEach(e => {
        e.addEventListener("click", async () => {
            let id = e.getAttribute("uid");
            let banned = await window.ScheduleAPI.getBanStatus(id);
            if (banned.banned) {
                e.classList.remove("unban")
                e.classList.add("ban")
                e.innerHTML = "Заблокировать"
                await window.ScheduleAPI.unbanUser(id)
            } else {
                e.classList.remove("ban")
                e.classList.add("unban")
                e.innerHTML = "Разблокировать"
                await window.ScheduleAPI.banUser(id, null)
            }
        })
    })



}





async function getAllTeacherNotPhoto() {

    let teacher = await window.ScheduleAPI.getTeachers();
    let not_photo = [];
    teacher.forEach(e => {
        if (e.photo_url == null) {
            not_photo.push(e)
        }
    })
    return not_photo

}