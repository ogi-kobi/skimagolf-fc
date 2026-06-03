/* スキマゴルフ LP — interactions (form validation / FAQ / sticky CTA / goal toggle) */
(function () {
  'use strict';

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    q.addEventListener('click', function () {
      var open = item.classList.contains('open');
      // close others
      document.querySelectorAll('.faq-item.open').forEach(function (o) {
        if (o !== item) { o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = null; }
      });
      if (open) {
        item.classList.remove('open');
        a.style.maxHeight = null;
      } else {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Sticky bottom CTA (show after hero) ---------- */
  var sticky = document.getElementById('sticky-cta');
  var formSec = document.getElementById('form');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var nearForm = false;
    if (formSec) {
      var r = formSec.getBoundingClientRect();
      // hide when the form is on screen
      nearForm = r.top < window.innerHeight && r.bottom > 0;
    }
    if (y > 520 && !nearForm) sticky.classList.add('show');
    else sticky.classList.remove('show');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Goal toggle (資料請求 / 説明会予約) ---------- */
  var goal = '資料請求';
  var toggleBtns = document.querySelectorAll('.toggle-cta button');
  var submitBtn = document.getElementById('submit-btn');
  var successMsg = document.getElementById('success-msg');
  toggleBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      toggleBtns.forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      goal = b.dataset.goal;
      if (goal === '説明会予約') {
        submitBtn.innerHTML = 'オンライン説明会を予約する <span class="btn-arrow">→</span>';
      } else {
        submitBtn.innerHTML = 'まずは無料資料を受け取る <span class="btn-arrow">→</span>';
      }
    });
  });

  /* ---------- Form validation ---------- */
  var form = document.getElementById('lead-form');
  var fields = document.getElementById('form-fields');
  var success = document.getElementById('form-success');

  function setInvalid(input, bad) {
    var field = input.closest('.field') || input.closest('.form-privacy');
    if (!field) return;
    if (field.classList.contains('form-privacy')) {
      field.style.color = bad ? '#ffd9d9' : '';
      var e = field.querySelector('.err');
      if (e) e.style.display = bad ? 'block' : 'none';
    } else {
      field.classList.toggle('invalid', bad);
    }
  }

  function validateField(input) {
    var v = (input.value || '').trim();
    var bad = false;
    if (input.id === 'f-name') bad = v.length < 1;
    else if (input.id === 'f-email') bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    else if (input.id === 'f-tel') bad = !/^0\d{9,10}$/.test(v.replace(/[-\s]/g, ''));
    else if (input.id === 'f-privacy') bad = !input.checked;
    setInvalid(input, bad);
    return !bad;
  }

  var required = ['f-name', 'f-email', 'f-tel', 'f-privacy'];
  required.forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    var ev = el.type === 'checkbox' ? 'change' : 'blur';
    el.addEventListener(ev, function () { validateField(el); });
    el.addEventListener('input', function () {
      var field = el.closest('.field');
      if (field && field.classList.contains('invalid')) validateField(el);
    });
  });

  // FormSubmit（formsubmit.co）のAJAXエンドポイント。
  // 静的ホスティング（GitHub Pages）からでも info@skimagolf.com へメール送信できる。
  // ※初回の1回だけ info@skimagolf.com に届く有効化メールのリンクを承認する必要あり。
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/ogi@atomic-heart.co.jp';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    var firstBad = null;
    required.forEach(function (id) {
      var el = document.getElementById(id);
      if (!validateField(el)) { ok = false; if (!firstBad) firstBad = el; }
    });
    if (!ok) {
      if (firstBad) {
        var t = (firstBad.closest('.field') || firstBad.closest('.form-privacy'));
        if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
        if (firstBad.focus) firstBad.focus({ preventScroll: true });
      }
      return;
    }

    var name = (document.getElementById('f-name') || {}).value || '';
    var email = (document.getElementById('f-email') || {}).value || '';
    var tel = (document.getElementById('f-tel') || {}).value || '';
    var stageEl = document.querySelector('input[name="stage"]:checked');
    var stage = stageEl ? stageEl.value : '';
    var msg = (document.getElementById('f-msg') || {}).value || '';

    var payload = {
      'お名前': name,
      'メールアドレス': email,
      '電話番号': tel,
      'ご検討の段階': stage,
      'ご質問・ご要望': msg,
      '_subject': '【スキマゴルフFC】無料資料請求 - ' + name,
      '_template': 'table',
      '_captcha': 'false',
      '_honey': (document.getElementById('f-honey') || {}).value || ''
    };

    // 送信中はボタンを無効化＆ラベル変更（二重送信防止）
    var btnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.style.opacity = '.7';
    submitBtn.innerHTML = '送信中…';

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) { return res.json().catch(function () { return {}; }).then(function (j) { return { ok: res.ok, body: j }; }); })
      .then(function (r) {
        // FormSubmitは success:"true"（文字列）を返す。失敗時は success:"false" + message。
        var success_ok = r.ok && (r.body.success === 'true' || r.body.success === true);
        if (!success_ok) throw new Error((r.body && r.body.message) || '送信に失敗しました');
        successMsg.innerHTML = 'ご請求ありがとうございます。<br>担当より資料をお送りいたします。';
        fields.style.display = 'none';
        success.classList.add('show');
        window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
      })
      .catch(function (err) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '';
        submitBtn.innerHTML = btnHtml;
        alert('送信に失敗しました。お手数ですが、お電話（080-2137-2435）またはinfo@skimagolf.com宛にご連絡ください。\n\n（' + (err && err.message ? err.message : 'ネットワークエラー') + '）');
      });
  });
})();
