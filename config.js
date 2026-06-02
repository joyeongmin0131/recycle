// ================================================================
//  분리수거 게임 설정 파일  ·  config.js
//  이 파일만 수정하면 게임 내용을 바꿀 수 있어요!
// ================================================================

const CONFIG = {

  // ── 게임 제목 ─────────────────────────────────────────────────
  title: "분리수거 챌린지",
  subtitle: "시간 안에 최대한 많이 맞혀보세요!",

  // ── 총 게임 시간 (초 단위) ────────────────────────────────────
  gameDuration: 30,

  // ── 보너스 문제 설정 ──────────────────────────────────────────
  //  bonusChance : 보너스 문제가 나올 확률  (0.15 = 15%)
  //  bonusPoints : 보너스 문제 맞혔을 때 점수
  bonusChance: 0.15,
  bonusPoints: 5,

  // ── 문제 순서 섞기 (true: 랜덤 / false: 순서대로) ─────────────
  shuffle: true,

  // ── 분리수거 카테고리 4가지 ───────────────────────────────────
  //  name  : 버튼에 표시되는 이름 ← 원하는 이름으로 자유롭게 수정!
  //  emoji : 버튼 아이콘 (이모지)
  //  color : 버튼 테두리·강조 색상 (HEX 코드)
  categories: [
    { name: "종이류",     emoji: "📄", color: "#4A90D9" },
    { name: "플라스틱",   emoji: "♻️", color: "#F5A623" },
    { name: "비닐",       emoji: "🛍️", color: "#7ED321" },
    { name: "일반쓰레기", emoji: "🗑️", color: "#9B9B9B" }
  ],

  // ── 문제 목록 ─────────────────────────────────────────────────
  //  image  : images/ 폴더 안의 파일명  예) "images/newspaper.jpg"
  //  answer : 정답 카테고리 번호
  //            0 = 종이류 / 1 = 플라스틱 / 2 = 비닐 / 3 = 일반쓰레기
  //  name   : 쓰레기 이름 — 오답일 때 정답 공개에 표시됨
  // -----------------------------------------------------------------
  //  ✅ 문제 추가 방법:
  //     1. images/ 폴더에 사진 파일을 넣는다
  //     2. 아래에 한 줄 추가  { image: "images/파일명.jpg", answer: 번호, name: "이름" },
  // -----------------------------------------------------------------
  items: [
    { image: "images/1.jpg",     answer: 2, name: "초콜릿 포장지"     },
    { image: "images/2.jpg",     answer: 0, name: "우유곽"     },
    { image: "images/3.jpg",     answer: 0, name: "종이"     },
    { image: "images/4.jpg",   answer: 2, name: "비닐봉지"   },
    { image: "images/5.jpg",  answer: 0, name: "종이컵" },
    { image: "images/6.jpg",     answer: 0, name: "종이"     },
    { image: "images/7.jpg",     answer: 2, name: "과자 포장지"     },
    { image: "images/8.jpg", answer: 0, name: "학습지" },
    {image: "images/9.jpg",     answer: 0, name: "우유곽"     },
    {image: "images/10.jpg",    answer: 2, name: "사탕 포장지"         },
    {image: "images/11.jpg",    answer: 0, name: "음료 포장곽" },
    {image: "images/12.jpg",    answer: 0, name: "우유곽"   },
    {image: "images/13.jpg",    answer: 3, name: "금속 부품"         },
    {image: "images/14.jpg",    answer: 2, name: "과자 포장지"     },
    { image: "images/15.jpg",     answer:2 , name: "포장지"     },
    { image: "images/16.jpg",     answer: 0, name: "종이"     },
    { image: "images/17.jpg",     answer: 0, name: "모의고사 시험지"     },
    { image: "images/18.jpg",   answer: 0, name: "안내책자"   },
    { image: "images/19.jpg",  answer: 3, name: "코팅 종이" },
    { image: "images/20.jpg",     answer: 3, name: "풍선"     },
    { image: "images/21.jpg",     answer: 1, name: "플라스틱 지비츠"     },
    { image: "images/22.jpg", answer: 0, name: "포장용 박스" },
    {image: "images/23.jpg",     answer: 1, name: "플라스틱 음료 쓰레기"     },
    {image: "images/24.jpg",    answer: 3, name: "머리끈"         },
    {image: "images/25.jpg",    answer: 3, name: "자" },
    {image: "images/26.jpg",    answer: 1, name: "플라스틱 음료 쓰레기"   },
    {image: "images/27.jpg",    answer: 3, name: "볼펜"         },
    {image: "images/28.jpg",    answer: 3, name: "미니 말랑이"     },
    { image: "images/29.jpg",     answer: 1, name: "플라스틱 음료 쓰레기"     },
    { image: "images/30.jpg",     answer: 1, name: "플라스틱 음료 쓰레기"     },
    { image: "images/31.jpg",     answer: 1, name: "플라스틱 음료 쓰레기"     },
    { image: "images/32.jpg",   answer: 1, name: "포커칩 장난감"   },
    { image: "images/33.jpg",  answer: 1, name: "플라스틱 음료 쓰레기" },
    { image: "images/34.jpg",     answer: 1, name: "플라스틱 음료 쓰레기"     },
    { image: "images/35.jpg",     answer: 2, name: "사탕 비닐"     },
    { image: "images/36.jpg", answer: 3, name: "액정" },
    {image: "images/37.jpg",     answer: 2, name: "사탕 포장지"     },
    {image: "images/38.jpg",    answer: 2, name: "비닐"         },
    {image: "images/39.jpg",    answer: 3, name: "담배곽" },
    {image: "images/40.jpg",    answer: 2, name: "사탕 포장지"   },
    { image: "images/41.jpg",     answer: 1, name: "플라스틱 빗"     },
    { image: "images/42.jpg",     answer: 3, name: "담배곽"     },
    { image: "images/43.jpg",     answer: 3, name: "아이스트림 막대"     },
    { image: "images/44.jpg",     answer: 2, name: "과자 봉지"     },
    { image: "images/45.jpg", answer: 1, name: "플라스틱 음료 쓰레기" },
    {image: "images/46.jpg",     answer: 2, name: "과자 봉지"     },
    {image: "images/47.jpg",    answer: 2, name: "과자 봉지"         },
    {image: "images/48.jpg",    answer: 3, name: "음료 포장지" },
    {image: "images/49.jpg",    answer: 1, name: "플라스틱 지비츠"   },
    // 👇 여기에 계속 문제를 추가하세요
    // { image: "images/파일명.jpg", answer: 정답번호, name: "이름" },
  ]
};
