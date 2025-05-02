# Suwon Christian International School (SCIS) Website

This repository contains the official website for Suwon Christian International School (SCIS), a Christian international school located in Suwon, South Korea.

## Overview

The SCIS website serves as the primary online presence for the school, providing information in both Korean and English. It covers school introduction, educational programs, admission procedures, community activities, and interactive features for students, parents, and staff.

## Features

- **Bilingual Platform:** Supports both Korean and English, with automatic language detection and manual switching.
- **Core Content Pages:** Includes About Us, Education, Admission, and Community sections for both languages.
- **Interactive Components:**
  - **Announcements:** Modal popups for important notifications, with "Don't show today" functionality.
  - **Gallery:** Responsive photo gallery organized by folders.
  - **Calendar:** School event calendar with monthly navigation and event details.
  - **Admission Form:** Online application and inquiry form.
- **Administrative Tools:** Admin page for managing announcements, gallery content, and calendar events.

## Website Structure

- **Language Detection:**  
  On first visit, the site detects user language preference via cookies and IP location, redirecting to `/ko/` (Korean) or `/en/` (English) as appropriate. Users can manually switch languages from the header menu.

- **Main Sections:**
  - `/ko/index.html` – 학교 소개 (School Introduction)
  - `/ko/education.html` – 교육과정 (Education)
  - `/ko/admission.html` – 입학절차 (Admission)
  - `/ko/community.html` – 커뮤니티 (Community)
  - `/en/index.html` – About Us
  - `/en/education.html` – Education
  - `/en/admission.html` – Admission
  - `/en/community.html` – Community

- **Key Files:**
  - `index.html` – Root file with language detection logic
  - `admin.html` – Administration interface
  - `vendor/announce.js` – Announcement system logic
  - `vendor/calendar.js` – Calendar component
  - `assets/css/` – Stylesheets for various pages

## Getting Started

To view or develop the website locally:

1. Clone this repository.
2. Open `index.html` in your browser.
3. For development, edit the HTML, CSS, or JS files as needed.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for improvements or bug fixes.

## License

This project is the property of Suwon Christian International School. For usage or distribution inquiries, please contact the school administration.

---

For more details on the website's architecture and features, see the [DeepWiki documentation](https://deepwiki.com/mangostin2010/mangostin2010.github.io).

## TODO

- 일정 캘린더 사진 확대 기능 (index.html, announcement)
- 커뮤니티 → 일정 / 캘린더 / 식단 따로 배치 (식단 이미지는 장은윤 사모님에게 받아야 함)
- Admin Page Auth 강화 & 공지 문제 해결 (사진 여러개) & 사진 업로드 웹에서 할 수 있도록 (github로 push 혹은 다른 방법...)