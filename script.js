const firebaseConfig = {
  apiKey: "AIzaSyBIOBhNJFZTLkEuRceTFFDRKSlP9otqVAM",
  authDomain: "mceid-d3d72.firebaseapp.com",
  projectId: "mceid-d3d72",
  storageBucket: "mceid-d3d72.firebasestorage.app",
  messagingSenderId: "1001646276953",
  appId: "1:1001646276953:web:8e4dce5656e029158e4c48"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

if (!sessionStorage.getItem('visitLogged')) {
  db.collection('visits').add({
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    userAgent: navigator.userAgent || "",
    language: navigator.language || ""
  });

  incrementStat('visits');
  sessionStorage.setItem('visitLogged', 'true');
}
async function saveNameToFirebase(name) {
  try {
    await db.collection("greetings").add({
      name: name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      userAgent: navigator.userAgent || "",
      language: navigator.language || ""
    });
    console.log("Name saved:", name);
  } catch (error) {
    console.error("Save name error:", error);
  }
}
async function incrementStat(fieldName) {
  try {
    await db.collection("stats").doc("counts").set({
      [fieldName]: firebase.firestore.FieldValue.increment(1)
    }, { merge: true });
  } catch (error) {
    console.error(error);
  }
}

const bg = document.querySelector('.bg');
const CARD_SRC = "EidCard/EidCard3.png";
const cardImg = new Image();
cardImg.src = CARD_SRC;
async function trackEvent(eventName) {
  try {
    await db.collection("analytics").add({
      event: eventName,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      userAgent: navigator.userAgent || "",
      language: navigator.language || ""
    });
  } catch (error) {
  }
}

function generateCard() {
  const name = document.getElementById('nameInput').value.trim();
  if (!name) {
    document.getElementById('nameInput').focus();
    return;
  }
  saveNameToFirebase(name);
  document.querySelector('.social-bar').style.display = 'none';
  incrementStat('generates');
  document.querySelector('.footer').classList.add('hide');
  bg.classList.add('dim');
  document.getElementById('state-input').style.display = 'none';


  const result = document.getElementById('state-result');
  result.style.display = 'flex';
  result.classList.remove('show');
  void result.offsetWidth;
  result.classList.add('show');

  if (cardImg.complete && cardImg.naturalWidth > 0) {
    draw(name);
  } else {
    cardImg.onload = () => draw(name);
  }
}

function draw(name) {
  const canvas = document.getElementById('card-canvas');
  const W = cardImg.naturalWidth;
  const H = cardImg.naturalHeight;

  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(cardImg, 0, 0, W, H);

  const nameY = H * 0.77;
  let fontSize = Math.floor(W * 0.05);
  ctx.font = `650 ${fontSize}px Tajawal, Arial`;

  while (ctx.measureText(name).width > W * 0.42 && fontSize > 22) {
    fontSize -= 2;
    ctx.font = `650 ${fontSize}px Tajawal, Arial`;
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.05)';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = '#3D1164';
  ctx.fillText(name, W * 0.67, nameY);

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  const tw = ctx.measureText(name).width;
  const textX = W * 0.67;

}

function goBack() {
  bg.classList.remove('dim');
  document.getElementById('state-result').style.display = 'none';
  document.querySelector('.social-bar').style.display = 'flex';
  const input = document.getElementById('state-input');
  input.style.display = 'flex';

  document.querySelector('.footer').classList.remove('hide');
  input.classList.remove('show');
  void input.offsetWidth;
  input.classList.add('show');

  const inp = document.getElementById('nameInput');
  inp.value = '';
  inp.focus();
}

function saveCard() {
  incrementStat('downloads');
  const name = document.getElementById('nameInput').value.trim() || 'بطاقة';
  const canvas = document.getElementById('card-canvas');
  const a = document.createElement('a');
  a.download = `معايدة-${name}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
}

async function shareCard() {
  const canvas = document.getElementById('card-canvas');
  incrementStat('shares');
  canvas.toBlob(async (blob) => {
    const file = new File([blob], 'eid-card.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        trackEvent('share');
        await navigator.share({
          files: [file],
          title: ' ‫#عيد_التصنيع‬'
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      saveCard();
    }
  }, 'image/png');
}

document.getElementById('nameInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') generateCard();
});