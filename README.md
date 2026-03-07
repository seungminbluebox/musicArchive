# MusicArchive: Digital Record Curator 💿

> **음악적 영감을 아카이빙하는 고해상도 디지털 바이닐 플랫폼**
>
> 시각적 몰입감과 청각적 경험을 결합한 스크롤리텔링(Scrollytelling) 기반의 뮤직 아카이브 프로젝트입니다. 단순히 음악을 듣는 것을 넘어, 곡이 가진 분위기와 가사의 의미를 시각적으로 감상할 수 있는 경험을 제공합니다.

---

## 🚀 Key Features

### 1. High-Fidelity Interactive LP Model

- **3D Depth Model**: CSS와 Framer Motion을 사용하여 스핀들 홀(Spindle hole)의 깊이감과 바이닐 특유의 질감을 물리적으로 재현한 디지털 LP 모델링.
- **Dynamic Rotation Logic**: 음악 재생 상태와 연동되어 끊김 없이 영구적으로 회전하는 애니메이션 시스템.
- **Playback Interaction**: 재생 시 LP가 슬리브에서 55% 돌출되어 회전하는 직관적인 상태 피드백.

### 2. Immersive Scrollytelling Layout

- **Deterministic Random Layout**: `song.id` 기반의 시드(Seed) 값을 활용하여, 매번 정해진 위치가 아닌 각 곡의 고유한 분위기에 맞춰 이미지 레이아웃이 유동적으로 배치되는 시스템 구축.
- **Micro-interactions**: 스크롤 깊이에 따른 배경 컬러 전이(Theme transition), 요소별 지연 로딩(Fade-in), 상단 이동 버튼 등의 디테일한 인터랙션.
- **Typography-centric Design**: 가사의 감정선을 극대화하기 위해 `whitespace-pre-wrap`을 통한 사용자 정의 간격 조절 및 미니멀한 타이포그래피 스타일링.

### 3. Glassmorphism UI/UX

- **Visual Clarity**: 오리지널 레이아웃의 심미성을 해치지 않으면서도 가독성을 확보하기 위한 `backdrop-blur` 및 고대비 시스템 버튼 디자인.
- **Global Audio Progress**: 페이지 최상단에 배치된 액센트 컬러 진행바를 통해 콘텐츠 감상 중에도 재생 상태를 실시간으로 확인 가능.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Data Management**: JSON-based Static Data Archiving
- **State Management**: React Context API (Audio Engine)

---

## 🎨 Design Philosophy: "The Archive"

이 프로젝트는 **'기록(Archive)'**과 **'물성(Materiality)'**에 집중했습니다.

- **Minimalism**: 불필요한 내비게이션 바와 장식적 요소를 과감히 제거하고 콘텐츠(음악, 가사, 이미지) 자체에 집중할 수 있는 환경을 조성했습니다.
- **Authenticity**: 실제 LP판의 블랙 테이프 마감, 중앙 홀의 깊이감, 바이닐 특유의 그루브(Groove)를 디지털로 복제하여 사용자에게 소장하는 듯한 경험을 제공하고자 했습니다.

---

## 📂 Project Structure

```text
src/
├── app/                  # Next.js App Router (Page Layouts)
├── components/           # UI Components (LP Visuals, Scrollytelling logic)
├── context/              # Audio Engine & Global State
├── data/                 # Song metadata & Lyrics (JSON)
└── types/                # TypeScript Interfaces
```

---

## 🎯 Development Focus

- **Performance**: 복잡한 애니메이션 속에서도 매끄러운 사용자 경험을 위해 Framer Motion의 GPU 가속 활용.
- **Responsiveness**: 모바일과 데스크탑 환경 모두에서 최적화된 스크롤링 경험을 제공하기 위한 반응형 그리드 설계.
- **Data-Driven UI**: `songs.json` 데이터 구조 변경만으로 전체 페이지의 테마 컬러와 레이아웃이 자동으로 적응하는 확장성 구현.

---

## 🛠 Data Structure (JSON)

### 1. 싱글 곡 (Single Track)

단일 곡 아카이빙 시 사용되는 기본 형식입니다.

```json
{
  "id": "single-01",
  "title": "orange",
  "artist": "Coll!n",
  "themeBase": "#F4CCAC",
  "themeSub": "#E6A17C",
  "themeAccent": "#D1603D",
  "themeText": "#FFFFFF",
  "audioSrc": "/audio/orange.flac",
  "images": ["/img/1.jpg", "/img/2.jpg", "/img/3.jpg"],
  "highlightLyrics": "가사 내용...",
  "log": "곡에 대한 큐레이터의 노트",
  "createdAt": "2026-03-07T00:00:00Z"
}
```

### 2. 앨범 (Multi-track Album)

여러 곡이 포함된 앨범 형식입니다. `tracks` 배열을 통해 UI가 자동으로 앨범형으로 전환됩니다.

```json
{
  "id": "album-01",
  "title": "Summer Archive",
  "artist": "Coll!n",
  "themeBase": "#F4CCAC",
  "themeSub": "#E6A17C",
  "themeAccent": "#D1603D",
  "themeText": "#FFFFFF",
  "tracks": [
    {
      "id": "trk-1",
      "title": "orange",
      "audioSrc": "/audio/orange.flac",
      "highlightLyrics": "트랙 1의 강조 가사"
    },
    {
      "id": "trk-2",
      "title": "blue",
      "audioSrc": "/audio/blue.mp3",
      "highlightLyrics": "트랙 2의 강조 가사"
    }
  ],
  "images": ["/img/1.jpg", "/img/2.jpg"],
  "log": "앨범 전체를 관통하는 큐레이터의 노트",
  "createdAt": "2026-03-07T00:00:00Z"
}
```

---
