const bg = document.querySelector('.bg');
const CARD_SRC = "EidCard.png"
const cardImg = new Image();
cardImg.src = CARD_SRC;

function generateCard() {
  const name = document.getElementById('nameInput').value.trim();
  if (!name) { document.getElementById('nameInput').focus(); return; }
  document.querySelector('.footer').classList.add('hide');
  bg.classList.add('dim');
  document.getElementById('state-input').style.display = 'none';
  const result = document.getElementById('state-result');
  result.style.display = 'flex';
  result.classList.remove('show');
  void result.offsetWidth;
  result.classList.add('show');

  if (cardImg.complete && cardImg.naturalWidth > 0) draw(name);
  else cardImg.onload = () => draw(name);
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
  ctx.font = `700 ${fontSize}px Tajawal, Arial`;
  
  while (ctx.measureText(name).width > W * 0.42 && fontSize > 22) {
    fontSize -= 2;
    ctx.font = `700 ${fontSize}px Tajawal, Arial`;
  }
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.18)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#ffffff';   
  ctx.fillText(name, W * 0.67, nameY); 
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  const tw = ctx.measureText(name).width;
  ctx.strokeStyle = 'rgba(80,100,140,0.2)';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(W / 2 - tw / 2, nameY + fontSize * 0.68);
  ctx.lineTo(W / 2 + tw / 2, nameY + fontSize * 0.68);
  ctx.stroke();
}

function goBack() {
  bg.classList.remove('dim');
  document.getElementById('state-result').style.display = 'none';
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
  const name = document.getElementById('nameInput').value.trim() || 'بطاقة';
  const canvas = document.getElementById('card-canvas');
  const a = document.createElement('a');
  a.download = `معايدة-${name}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
}

document.getElementById('nameInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') generateCard();
});
