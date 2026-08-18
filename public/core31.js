/* =========================================================
   PHỐ AI ECOSYSTEM — CORE 3.1
   Smart Input + Content Intelligence + Workflow + Calendar
   ========================================================= */

const $ = id => document.getElementById(id);

const toast = message => {
  const el = $('toast');
  if (!el) return;

  el.textContent = message;
  el.classList.add('show');

  setTimeout(() => {
    el.classList.remove('show');
  }, 2400);
};


/* =========================================================
   STORAGE
   ========================================================= */

const CORE31_LIB = 'pho-core-31-library';
const CORE31_CAL = 'pho-core-31-calendar';

let lastStructured = null;
let imageData = [];


/* =========================================================
   TAB
   ========================================================= */

document.querySelectorAll('.tab').forEach(button => {

  button.onclick = () => {

    document.querySelectorAll('.tab').forEach(x => {
      x.classList.toggle('active', x === button);
    });

    document.querySelectorAll('.tabpanel').forEach(x => {
      x.classList.toggle(
        'active',
        x.id === 'tab-' + button.dataset.tab
      );
    });

  };

});


/* =========================================================
   API
   ========================================================= */

async function api(name, body) {

  const response = await fetch(
    '/.netlify/functions/' + name,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  const result = await response
    .json()
    .catch(() => ({
      error: 'Phản hồi máy chủ không hợp lệ'
    }));

  if (!response.ok) {
    throw new Error(
      result.error ||
      result.message ||
      'Lỗi máy chủ'
    );
  }

  return result;
}


/* =========================================================
   HELPERS
   ========================================================= */

function esc(s = '') {

  return String(s).replace(
    /[&<>"']/g,
    m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m])
  );

}


function normalize(v) {

  if (Array.isArray(v)) {
    return v.join('\n');
  }

  if (v == null) {
    return '';
  }

  return String(v);
}


/* =========================================================
   AI STRUCTURED DATA
   ========================================================= */

const fields = [

  ['topic', 'Chủ đề'],
  ['product', 'Sản phẩm'],
  ['style', 'Phong cách'],
  ['title', 'Tiêu đề'],

  ['hook', 'Hook'],
  ['content', 'Nội dung chính'],
  ['story', 'Câu chuyện'],
  ['insight', 'Insight khách hàng'],

  ['cta', 'CTA'],
  ['hashtags', 'Hashtag'],
  ['keywords', 'Từ khóa SEO'],
  ['channel', 'Kênh phù hợp'],

  ['format', 'Định dạng'],
  ['duration', 'Thời lượng'],
  ['notes', 'Ghi chú']

];


function renderStructured(data) {

  lastStructured = data;

  if ($('analysisState')) {
    $('analysisState').textContent = 'Đã phân loại';
    $('analysisState').style.background = '#155c40';
  }

  if (!$('structured')) return;

  $('structured').innerHTML = fields.map(
    ([key, label]) => `

      <label class="field">

        <b>${label}</b>

        <textarea
          data-structured="${key}"
        >${esc(normalize(data?.[key]))}</textarea>

      </label>

    `
  ).join('');

}


function collectStructured() {

  const out = {};

  document
    .querySelectorAll('[data-structured]')
    .forEach(el => {

      out[el.dataset.structured] =
        el.value.trim();

    });

  return out;

}


/* =========================================================
   SMART INPUT — TEXT
   ========================================================= */

if ($('clearText')) {

  $('clearText').onclick = () => {
    $('rawText').value = '';
  };

}


if ($('analyzeText')) {

  $('analyzeText').onclick = async () => {

    const text =
      $('rawText').value.trim();

    if (!text) {
      return toast(
        'Hãy dán nội dung trước'
      );
    }

    $('analysisState').textContent =
      'Đang phân tích...';

    try {

      const result = await api(
        'core31-analyze',
        {
          mode: 'text',
          text
        }
      );

      renderStructured(
        result.structured
      );

      toast(
        'Đã phân loại nội dung'
      );

    }

    catch (e) {

      $('analysisState').textContent =
        'Có lỗi';

      toast(e.message);

    }

  };

}


/* =========================================================
   IMAGE INPUT
   ========================================================= */

if ($('imageInput')) {

  $('imageInput').onchange =
    async event => {

      const files =
        [...event.target.files]
        .slice(0, 4);

      imageData = [];

      if ($('preview')) {
        $('preview').innerHTML = '';
      }

      for (const file of files) {

        if (
          file.size >
          5 * 1024 * 1024
        ) {

          toast(
            'Ảnh quá 5MB: ' +
            file.name
          );

          continue;

        }

        const data =
          await new Promise(
            (resolve, reject) => {

              const reader =
                new FileReader();

              reader.onload =
                () =>
                  resolve(
                    reader.result
                  );

              reader.onerror =
                reject;

              reader.readAsDataURL(
                file
              );

            }
          );

        imageData.push(data);

        if ($('preview')) {

          const img =
            document.createElement(
              'img'
            );

          img.src = data;

          $('preview')
            .appendChild(img);

        }

      }

    };

}


/* =========================================================
   AI IMAGE ANALYSIS
   ========================================================= */

if ($('analyzeImage')) {

  $('analyzeImage').onclick =
    async () => {

      if (!imageData.length) {

        return toast(
          'Hãy chọn ảnh trước'
        );

      }

      $('analysisState')
        .textContent =
        'Đang phân tích ảnh...';

      try {

        const result =
          await api(
            'core31-analyze',
            {
              mode: 'image',
              images: imageData,
              text:
                $('rawText')
                .value
                .trim()
            }
          );

        renderStructured(
          result.structured
        );

        toast(
          'Đã phân tích ảnh'
        );

      }

      catch (e) {

        $('analysisState')
          .textContent =
          'Có lỗi';

        toast(e.message);

      }

    };

}


/* =========================================================
   CONTENT LIBRARY
   ========================================================= */

function getLib() {

  try {

    const rows =
      JSON.parse(
        localStorage.getItem(
          CORE31_LIB
        )
      );

    return Array.isArray(rows)
      ? rows
      : [];

  }

  catch {

    return [];

  }

}


function saveLib(rows) {

  localStorage.setItem(
    CORE31_LIB,
    JSON.stringify(rows)
  );

}


/* =========================================================
   SAVE AI RESULT
   ========================================================= */

if ($('saveStructured')) {

  $('saveStructured').onclick =
    () => {

      if (!lastStructured) {

        return toast(
          'Chưa có dữ liệu phân tích'
        );

      }

      const row = {

        id:
          crypto.randomUUID(),

        ...collectStructured(),

        status: 'Ý tưởng',

        createdAt:
          new Date()
          .toISOString(),

        updatedAt:
          new Date()
          .toISOString()

      };

      const rows = getLib();

      rows.unshift(row);

      saveLib(rows);

      renderLibrary();

      toast(
        'Đã lưu vào kho 3.1'
      );

    };

}


/* =========================================================
   SEND CURRENT AI RESULT TO CALENDAR
   ========================================================= */

if ($('sendToCalendar')) {

  $('sendToCalendar').onclick =
    () => {

      if (!lastStructured) {

        return toast(
          'Chưa có dữ liệu phân tích'
        );

      }

      const data =
        collectStructured();

      $('calTitle').value =
        data.title ||
        data.topic ||
        data.product ||
        'Nội dung mới';

      chooseCalendarChannel(
        data.channel
      );

      document
        .querySelector(
          '[data-tab="calendar"]'
        )
        ?.click();

      toast(
        'Đã chuyển sang lịch'
      );

    };

}


/* =========================================================
   SELECT CHANNEL HELPER
   ========================================================= */

function chooseCalendarChannel(
  channel
) {

  if (
    !channel ||
    !$('calChannel')
  ) return;

  const source =
    channel.toLowerCase();

  const options =
    [...$('calChannel').options];

  const hit =
    options.find(option => {

      const value =
        (
          option.value ||
          option.text
        )
        .toLowerCase();

      const firstWord =
        value.split(' ')[0];

      return (
        source.includes(value) ||
        source.includes(firstWord) ||
        value.includes(source)
      );

    });

  if (hit) {

    $('calChannel').value =
      hit.value;

  }

}


/* =========================================================
   WORKFLOW LIBRARY
   ========================================================= */

function renderLibrary() {

  let rows = getLib();


  /* -----------------------------------------
     Tương thích dữ liệu cũ
     ----------------------------------------- */

  let dataChanged = false;

  rows = rows.map(row => {

    if (!row.status) {

      dataChanged = true;

      return {
        ...row,
        status: 'Ý tưởng'
      };

    }

    return row;

  });


  if (dataChanged) {
    saveLib(rows);
  }


  /* -----------------------------------------
     Bộ lọc
     ----------------------------------------- */

  const status =
    $('filterStatus')
      ?.value || '';

  const channel =
    $('filterChannel')
      ?.value || '';

  const search =
    (
      $('filterSearch')
        ?.value || ''
    )
    .trim()
    .toLowerCase();


  /* -----------------------------------------
     Thống kê workflow
     ----------------------------------------- */

  const idea =
    rows.filter(
      x =>
        x.status ===
        'Ý tưởng'
    ).length;

  const preparing =
    rows.filter(
      x =>
        x.status ===
        'Đang chuẩn bị'
    ).length;

  const scheduled =
    rows.filter(
      x =>
        x.status ===
        'Đã lên lịch'
    ).length;

  const posted =
    rows.filter(
      x =>
        x.status ===
        'Đã đăng'
    ).length;


  if ($('workflowStats')) {

    $('workflowStats')
      .innerHTML = `

        💡 Ý tưởng:
        <b>${idea}</b>
        &nbsp;·&nbsp;

        ✍️ Chuẩn bị:
        <b>${preparing}</b>
        &nbsp;·&nbsp;

        📅 Lên lịch:
        <b>${scheduled}</b>
        &nbsp;·&nbsp;

        ✅ Đã đăng:
        <b>${posted}</b>

      `;

  }


  /* -----------------------------------------
     Lọc dữ liệu
     ----------------------------------------- */

  const filtered =
    rows.filter(x => {

      if (
        status &&
        x.status !== status
      ) {

        return false;

      }


      if (
        channel &&
        !String(
          x.channel || ''
        )
        .toLowerCase()
        .includes(
          channel.toLowerCase()
        )
      ) {

        return false;

      }


      if (search) {

        const text = [

          x.title,
          x.topic,
          x.product,
          x.content,
          x.style,
          x.channel,
          x.hashtags,
          x.keywords

        ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();


        if (
          !text.includes(search)
        ) {

          return false;

        }

      }


      return true;

    });


  if (!$('smartLibrary')) {
    return;
  }


  /* -----------------------------------------
     Render kho
     ----------------------------------------- */

  $('smartLibrary')
    .innerHTML =
    filtered.length

    ? filtered.map(x => `

      <div
        class="library-item"
        data-id="${x.id}"
      >

        <div
          style="
            display:flex;
            gap:10px;
            align-items:center;
            flex-wrap:wrap;
          "
        >

          <b>
            ${esc(
              x.title ||
              x.topic ||
              'Nội dung'
            )}
          </b>


          <select
            onchange="
              updateLibraryStatus(
                '${x.id}',
                this.value
              )
            "
          >

            <option
              value="Ý tưởng"
              ${
                x.status ===
                'Ý tưởng'
                ? 'selected'
                : ''
              }
            >
              💡 Ý tưởng
            </option>


            <option
              value="Đang chuẩn bị"
              ${
                x.status ===
                'Đang chuẩn bị'
                ? 'selected'
                : ''
              }
            >
              ✍️ Đang chuẩn bị
            </option>


            <option
              value="Đã lên lịch"
              ${
                x.status ===
                'Đã lên lịch'
                ? 'selected'
                : ''
              }
            >
              📅 Đã lên lịch
            </option>


            <option
              value="Đã đăng"
              ${
                x.status ===
                'Đã đăng'
                ? 'selected'
                : ''
              }
            >
              ✅ Đã đăng
            </option>

          </select>

        </div>


        <small>

          ${esc(x.product || '')}

          ${
            x.style
            ? ' · ' +
              esc(x.style)
            : ''
          }

          ${
            x.channel
            ? ' · ' +
              esc(x.channel)
            : ''
          }

        </small>


        <p>

          ${esc(
            (
              x.content || ''
            )
            .slice(0, 300)
          )}

        </p>


        <div class="actions">

          <button
            onclick="
              viewLibrary(
                '${x.id}'
              )
            "
          >
            👁 Xem
          </button>


          <button
            class="secondary"
            onclick="
              editLibrary(
                '${x.id}'
              )
            "
          >
            ✏️ Sửa
          </button>


          <button
            class="secondary"
            onclick="
              libraryToCalendar(
                '${x.id}'
              )
            "
          >
            📅 Đưa sang lịch
          </button>


          <button
            class="danger"
            onclick="
              removeLibrary(
                '${x.id}'
              )
            "
          >
            🗑 Xóa
          </button>

        </div>

      </div>

    `).join('')

    : `
      <p>
        Không có nội dung phù hợp.
      </p>
    `;

}


/* =========================================================
   CHANGE WORKFLOW STATUS
   ========================================================= */

window.updateLibraryStatus =
  (id, status) => {

    const rows =
      getLib();

    const item =
      rows.find(
        row =>
          row.id === id
      );

    if (!item) return;


    item.status =
      status;

    item.updatedAt =
      new Date()
      .toISOString();


    saveLib(rows);

    renderLibrary();

    toast(
      'Đã chuyển → ' +
      status
    );

  };


/* =========================================================
   WORKFLOW FILTER EVENTS
   ========================================================= */

[
  'filterStatus',
  'filterChannel',
  'filterSearch'
]
.forEach(id => {

  const el = $(id);

  if (!el) return;


  el.addEventListener(

    id === 'filterSearch'
      ? 'input'
      : 'change',

    () => {
      renderLibrary();
    }

  );

});


/* =========================================================
   VIEW CONTENT
   ========================================================= */

window.viewLibrary =
  id => {

    const item =
      getLib()
      .find(
        row =>
          row.id === id
      );

    if (!item) return;


    renderStructured(item);


    document
      .querySelector(
        '[data-tab="input"]'
      )
      ?.click();


    window.scrollTo({
      top:
        document.body
        .scrollHeight,

      behavior:
        'smooth'
    });


    toast(
      'Đã mở nội dung'
    );

  };


/* =========================================================
   EDIT CONTENT
   ========================================================= */

window.editLibrary =
  id => {

    const rows =
      getLib();

    const item =
      rows.find(
        row =>
          row.id === id
      );

    if (!item) return;


    const title =
      prompt(
        'Sửa tiêu đề:',
        item.title || ''
      );

    if (title === null) {
      return;
    }


    const content =
      prompt(
        'Sửa nội dung:',
        item.content || ''
      );

    if (content === null) {
      return;
    }


    item.title =
      title.trim();

    item.content =
      content.trim();

    item.updatedAt =
      new Date()
      .toISOString();


    saveLib(rows);

    renderLibrary();

    toast(
      'Đã cập nhật nội dung'
    );

  };


/* =========================================================
   LIBRARY → CALENDAR
   ========================================================= */

window.libraryToCalendar =
  id => {

    const rows =
      getLib();

    const item =
      rows.find(
        row =>
          row.id === id
      );

    if (!item) return;


    if ($('calTitle')) {

      $('calTitle').value =
        item.title ||
        item.topic ||
        item.product ||
        'Nội dung mới';

    }


    chooseCalendarChannel(
      item.channel
    );


    /*
      Ghi nhớ nguồn nội dung.
      Khi bấm Thêm lịch,
      calendar sẽ liên kết lại
      với item trong kho.
    */

    if ($('addSchedule')) {

      $('addSchedule')
        .dataset
        .libraryId =
        item.id;

    }


    document
      .querySelector(
        '[data-tab="calendar"]'
      )
      ?.click();


    toast(
      'Đã chuyển nội dung sang lịch'
    );

  };


/* =========================================================
   DELETE ONE CONTENT
   ========================================================= */

window.removeLibrary =
  id => {

    if (
      !confirm(
        'Xóa riêng nội dung này?'
      )
    ) {

      return;

    }


    const rows =
      getLib()
      .filter(
        row =>
          row.id !== id
      );


    saveLib(rows);

    renderLibrary();

    toast(
      'Đã xóa nội dung'
    );

  };


/* =========================================================
   CLEAR LIBRARY
   ========================================================= */

if ($('clearLibrary')) {

  $('clearLibrary').onclick =
    () => {

      if (
        !confirm(
          'Xóa toàn bộ kho CORE 3.1?'
        )
      ) {

        return;

      }


      localStorage
        .removeItem(
          CORE31_LIB
        );


      renderLibrary();


      toast(
        'Đã xóa toàn bộ kho'
      );

    };

}


/* =========================================================
   CALENDAR STORAGE
   ========================================================= */

function getCal() {

  try {

    const rows =
      JSON.parse(
        localStorage.getItem(
          CORE31_CAL
        )
      );

    return Array.isArray(rows)
      ? rows
      : [];

  }

  catch {

    return [];

  }

}


function saveCal(rows) {

  localStorage.setItem(
    CORE31_CAL,
    JSON.stringify(rows)
  );

}


/* =========================================================
   CALENDAR RENDER
   ========================================================= */

function renderCal() {

  const rows =
    getCal()
    .sort(
      (a, b) =>
        new Date(a.at) -
        new Date(b.at)
    );


  if (!$('scheduleList')) {
    return;
  }


  $('scheduleList')
    .innerHTML =
    rows.length

    ? rows.map(x => `

      <div
        class="
          schedule
          ${x.done
            ? 'done'
            : ''}
        "
        data-id="${x.id}"
      >

        <div>

          <b>
            ${esc(x.title)}
          </b>

          <small>

            ${esc(
              x.channel || ''
            )}

            ·

            ${new Date(
              x.at
            )
            .toLocaleString(
              'vi-VN'
            )}

            ${
              x.rang
              ? ' · 🔔 đã báo'
              : ''
            }

          </small>

        </div>


        <div class="actions">

          <button
            class="secondary"
            onclick="
              toggleDone(
                '${x.id}'
              )
            "
          >

            ${
              x.done
              ? 'Mở lại'
              : '✅ Đã đăng'
            }

          </button>


          <button
            class="danger"
            onclick="
              removeSchedule(
                '${x.id}'
              )
            "
          >
            Xóa
          </button>

        </div>

      </div>

    `).join('')

    : `
      <p>
        Chưa có lịch.
      </p>
    `;

}


/* =========================================================
   CALENDAR → UPDATE LIBRARY
   ========================================================= */

function syncLibraryStatus(
  libraryId,
  status
) {

  if (!libraryId) return;


  const rows =
    getLib();

  const item =
    rows.find(
      row =>
        row.id === libraryId
    );


  if (!item) return;


  item.status =
    status;

  item.updatedAt =
    new Date()
    .toISOString();


  saveLib(rows);

  renderLibrary();

}


/* =========================================================
   MARK POSTED / REOPEN
   ========================================================= */

window.toggleDone =
  id => {

    const rows =
      getCal();

    const item =
      rows.find(
        row =>
          row.id === id
      );


    if (!item) return;


    item.done =
      !item.done;


    saveCal(rows);

    renderCal();


    if (
      item.sourceLibraryId
    ) {

      syncLibraryStatus(

        item.sourceLibraryId,

        item.done
          ? 'Đã đăng'
          : 'Đã lên lịch'

      );

    }


    toast(
      item.done
        ? 'Đã đánh dấu: Đã đăng'
        : 'Đã mở lại lịch'
    );

  };


/* =========================================================
   DELETE SCHEDULE
   ========================================================= */

window.removeSchedule =
  id => {

    const rows =
      getCal();

    const item =
      rows.find(
        row =>
          row.id === id
      );


    saveCal(
      rows.filter(
        row =>
          row.id !== id
      )
    );


    renderCal();


    if (
      item?.sourceLibraryId &&
      !item.done
    ) {

      syncLibraryStatus(
        item.sourceLibraryId,
        'Đang chuẩn bị'
      );

    }


    toast(
      'Đã xóa lịch'
    );

  };


/* =========================================================
   ADD SCHEDULE
   ========================================================= */

if ($('addSchedule')) {

  $('addSchedule').onclick =
    () => {

      const title =
        $('calTitle')
        .value
        .trim();

      const date =
        $('calDate')
        .value;

      const time =
        $('calTime')
        .value;

      const channel =
        $('calChannel')
        .value;


      if (
        !title ||
        !date ||
        !time
      ) {

        return toast(
          'Điền đủ tiêu đề, ngày và giờ'
        );

      }


      const sourceLibraryId =
        $('addSchedule')
        .dataset
        .libraryId || null;


      const rows =
        getCal();


      rows.push({

        id:
          crypto.randomUUID(),

        title,

        channel,

        at:
          new Date(
            date +
            'T' +
            time
          )
          .toISOString(),

        done: false,

        rang: false,

        sourceLibraryId

      });


      saveCal(rows);

      renderCal();


      if (
        sourceLibraryId
      ) {

        syncLibraryStatus(
          sourceLibraryId,
          'Đã lên lịch'
        );

        delete $('addSchedule')
          .dataset
          .libraryId;

      }


      toast(
        'Đã thêm lịch'
      );

    };

}


/* =========================================================
   NOTIFICATION PERMISSION
   ========================================================= */

if ($('notificationBtn')) {

  $('notificationBtn').onclick =
    async () => {

      if (
        !(
          'Notification'
          in window
        )
      ) {

        return toast(
          'Trình duyệt không hỗ trợ Notification'
        );

      }


      const permission =
        await Notification
        .requestPermission();


      toast(

        permission ===
        'granted'

        ? 'Đã cho phép thông báo'

        : 'Chưa cấp quyền thông báo'

      );

    };

}


/* =========================================================
   TWO CHIMES
   ========================================================= */

async function twoChimes() {

  const AudioCtx =
    window.AudioContext ||
    window.webkitAudioContext;


  if (!AudioCtx) {
    return;
  }


  const ctx =
    new AudioCtx();


  const ping =
    start => {

      const oscillator =
        ctx.createOscillator();

      const gain =
        ctx.createGain();


      oscillator.type =
        'sine';

      oscillator
        .frequency
        .value =
        880;


      gain.gain
        .setValueAtTime(
          0.0001,
          start
        );


      gain.gain
        .exponentialRampToValueAtTime(
          0.22,
          start + 0.01
        );


      gain.gain
        .exponentialRampToValueAtTime(
          0.0001,
          start + 0.18
        );


      oscillator.connect(
        gain
      );

      gain.connect(
        ctx.destination
      );


      oscillator.start(
        start
      );

      oscillator.stop(
        start + 0.2
      );

    };


  const t =
    ctx.currentTime +
    0.02;


  ping(t);

  ping(
    t + 0.42
  );


  setTimeout(
    () => {

      ctx.close();

    },

    1100
  );

}


/* =========================================================
   CHECK DUE CALENDAR
   ========================================================= */

function checkDue() {

  const now =
    Date.now();

  const rows =
    getCal();

  let changed =
    false;


  rows.forEach(item => {

    if (
      item.done ||
      item.rang
    ) {

      return;

    }


    const at =
      new Date(
        item.at
      )
      .getTime();


    if (
      now >= at &&
      now - at < 90000
    ) {

      item.rang =
        true;

      changed =
        true;


      twoChimes();


      if (
        'Notification'
        in window &&
        Notification.permission ===
        'granted'
      ) {

        new Notification(

          'ĐẾN GIỜ ĐĂNG BÀI',

          {

            body:
              `${item.channel}: ${item.title}`,

            tag:
              'pho-core31-' +
              item.id,

            renotify:
              false

          }

        );

      }


      toast(
        '🔔 Đến giờ đăng: ' +
        item.title
      );

    }

  });


  if (changed) {

    saveCal(rows);

    renderCal();

  }

}


/* =========================================================
   CHECK EVERY 15 SECONDS
   ========================================================= */

setInterval(
  checkDue,
  15000
);


/* =========================================================
   DEFAULT DATE & TIME
   ========================================================= */

const now =
  new Date();


if ($('calDate')) {

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, '0');

  const day =
    String(
      now.getDate()
    ).padStart(2, '0');


  $('calDate').value =
    `${year}-${month}-${day}`;

}


if ($('calTime')) {

  const hour =
    String(
      now.getHours()
    ).padStart(2, '0');

  const minute =
    String(
      now.getMinutes()
    ).padStart(2, '0');


  $('calTime').value =
    `${hour}:${minute}`;

}


/* =========================================================
   START CORE 3.1
   ========================================================= */

renderCal();
renderLibrary();
