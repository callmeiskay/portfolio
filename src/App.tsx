import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowUpRight,
  Copy,
  Check,
  X,
  Plus,
  ArrowRight,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';

// --- INITIAL DATA ---
const INITIAL_PROFILE = {
  name: "Huỳnh Bá Nhật Huy",
  role: "Multimedia Communications & Graphic Designer / Co-Founder Homnao.Foto",
  subRole: "Visual Storyteller",
  location: "Đà Nẵng, Việt Nam",
  heroLabel: "About Me",
  philosophy: "Nhà thiết kế đồ họa, nhiếp ảnh gia, Co-Founder Homnao.Foto hiện đang sống và làm việc tại Đà Nẵng. Tập trung vào sự cân bằng giữa hệ thống lưới (Grid System), khoảng trắng và cảm xúc thị giác nguyên bản qua thiết kế ấn phẩm, nhận diện thương hiệu và sản xuất hình ảnh kỹ thuật số.",
  aboutHeading: "About Me",
  aboutLead: "Huỳnh Bá Nhật Huy là người thực hành sáng tạo đa phương tiện (Multimedia & Graphic Designer) và Co-Founder Homnao.Foto, hoạt động chuyên sâu trong lĩnh vực Thiết kế Đồ họa, Dàn trang Ấn phẩm và Sản xuất Hình ảnh tại Đà Nẵng.",
  aboutDetail: "Với nền tảng chuyên môn bài bản, phong cách làm việc của Huy hướng đến sự tĩnh lặng và trật tự thị giác: loại bỏ những chi tiết trang trí thừa thãi để làm nổi bật cấu trúc Typography, tỷ lệ lưới và cảm xúc chân thực của chất liệu.",
  aboutAvatarUrl: "",
  email: "homnao.foto@gmail.com",
  phone: "(+84) 905 xxx xxx",
  behance: "@callmeiskay",
  behanceUrl: "https://www.behance.net/callmeiskay",
  instagram: "@callmeiskay",
  instagramUrl: "https://www.instagram.com/callmeiskay",
  status: "Available for selected freelance & creative collaborations",
  // ĐẶT LỊCH: dán link (hoặc cả đoạn mã nhúng) của trang đặt lịch vào mục "Thông tin cá nhân" trong /admin.
  // Để trống thì mục Đặt lịch sẽ tự ẩn.
  bookingUrl: "",
  bookingHeading: "Đặt lịch",
  bookingText: "Chọn ngày và giờ phù hợp, lịch hẹn sẽ được xác nhận qua email.",
  bookingButton: "Đặt lịch ngay"
};

// Lấy địa chỉ từ link hoặc từ đoạn mã nhúng <iframe src="...">. Chỉ chấp nhận https.
const extractBookingUrl = (input) => {
  if (!input) return "";
  const text = String(input).trim().replace(/&amp;/g, "&");
  // 1) Mã "nút bấm" hoặc "nội tuyến" của Google Calendar: lấy địa chỉ trang đặt lịch bên trong
  const g = text.match(/https:\/\/calendar\.google\.com\/calendar\/(?:u\/\d+\/)?appointments\/[^'"\s<>\\]+/i);
  if (g) return g[0];
  // 2) Mã <iframe src="...">
  const f = text.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  if (f && /^https:\/\//i.test(f[1])) return f[1];
  // 3) Link thường
  return /^https:\/\/[^\s<>'"]+$/i.test(text) ? text : "";
};

const INITIAL_PROJECTS = [
  {
    id: "danang-branding",
    title: "Đà Nẵng City Emblem & Brand Identity",
    subtitle: "Hệ thống nhận diện thương hiệu và biểu trưng đô thị tối giản",
    category: "Design & Brand Identity",
    year: "2026",
    client: "Nghiên cứu Nhận diện Đô thị Đà Nẵng",
    role: "Brand Identity Designer",
    tools: ["Adobe Illustrator", "Geometric Grid", "Flat Vector"],
    summary: "Tái cấu trúc hình tượng đô thị thông qua ngôn ngữ hình học tối giản cùng hệ thống lưới tỷ lệ chuẩn xác.",
    challenge: "Dung hòa tính trang trọng của biểu trưng với thẩm mỹ tinh gọn, hiện đại.",
    solution: "Sử dụng các đường nét kỷ luật, cấu trúc vòng tròn đồng tâm và mảng phẳng có độ tương phản cao.",
    deliverables: ["Vector Emblem Concepts", "Grid Construction Manual", "Brand Applications"],
    palette: ["#111111", "#1D3557", "#E63946", "#F4A261", "#F7F7F5"],
    visualType: "danang",
    imageUrl: "",
    igLink: "",
    behanceLink: "https://www.behance.net/callmeiskay",
    behanceEmbedId: ""
  },
  {
    id: "portrait-series",
    title: "Portraiture & Human Light",
    subtitle: "Series nhiếp ảnh chân dung tĩnh lặng & cảm xúc nguyên bản",
    category: "Portrait",
    year: "2026",
    client: "Homnao.Foto Portrait Project",
    role: "Photographer & Visual Director",
    tools: ["Natural Light", "Lightroom Classic", "Analog Aesthetic"],
    summary: "Khám phá chiều sâu nội tâm nhân vật qua ánh sáng tự nhiên và khoảng trắng tĩnh lặng.",
    challenge: "Bắt trọn khoảnh khắc chân thực và cảm xúc tự nhiên nhất của nhân vật trước ống kính.",
    solution: "Sử dụng ánh sáng mềm, bố cục tối giản và tôn trọng tối đa chất liệu hình ảnh nguyên bản.",
    deliverables: ["Portrait Series", "Curated Photo Book", "Color Grading Preset"],
    palette: ["#231F20", "#5E503F", "#C6AC8F", "#EAE0D5", "#FAF9F6"],
    visualType: "editorial",
    imageUrl: "",
    igLink: "https://instagram.com/callmeiskay",
    behanceLink: "https://www.behance.net/callmeiskay",
    behanceEmbedId: ""
  },
  {
    id: "yearbook-project",
    title: "Yearbook — Ký ức Thời Thanh Xuân",
    subtitle: "Ấn phẩm kỷ yếu học sinh sinh viên với phong cách editorial tinh tế",
    category: "Yearbook",
    year: "2026",
    client: "Homnao.Foto Yearbook Series",
    role: "Art Director & Photographer",
    tools: ["Editorial Layout", "Portrait Series", "Print Production"],
    summary: "Ghi lại những thước phim tuổi trẻ qua góc nhìn nhiếp ảnh dàn trang tạp chí cao cấp.",
    challenge: "Tránh lối mòn của các mẫu kỷ yếu thông thường để tạo ra một ấn phẩm mang giá trị lưu giữ vượt thời gian.",
    solution: "Kết hợp giữa nhiếp ảnh chân dung tự nhiên và kỹ thuật dàn trang tối giản, sang trọng.",
    deliverables: ["Yearbook Publication", "Photo Archive", "Visual Direction"],
    palette: ["#141413", "#D95326", "#D8CFC4", "#ECEAE4", "#FFFFFF"],
    visualType: "ananas",
    imageUrl: "",
    igLink: "",
    behanceLink: "https://www.behance.net/callmeiskay",
    behanceEmbedId: ""
  },
  {
    id: "event-storytelling",
    title: "Event Visual Storytelling",
    subtitle: "Ghi lại nhịp điệu và không gian sự kiện qua ống kính nhiếp ảnh",
    category: "Event",
    year: "2026",
    client: "Homnao.Foto Event Coverage",
    role: "Lead Event Photographer",
    tools: ["Available Light", "Dynamic Framing", "Post-Production"],
    summary: "Tài liệu hóa các sự kiện văn hóa, nghệ thuật và thương hiệu với góc nhìn điện ảnh.",
    challenge: "Làm nổi bật bầu không gian và cảm xúc của sự kiện giữa ánh sáng phức tạp.",
    solution: "Nắm bắt khoảnh khắc chớp nhoáng với bố cục chặt chẽ và tông màu nhất quán.",
    deliverables: ["Event Photo Gallery", "Highlight Reel", "Digital Deliverables"],
    palette: ["#0F1419", "#2B3A4A", "#6C809A", "#D49B72", "#F2EFE9"],
    visualType: "cinema",
    imageUrl: "",
    igLink: "https://instagram.com/callmeiskay",
    behanceLink: "https://www.behance.net/callmeiskay",
    behanceEmbedId: ""
  }
];

export default function App() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);

  // Đọc danh sách dự án từ file public/content/projects.json (file này do trang /admin chỉnh sửa).
  // Nếu không đọc được, trang vẫn dùng dữ liệu mặc định INITIAL_PROJECTS ở trên.
  useEffect(() => {
    fetch('/content/projects.json')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (data && Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(
            data.projects.map((p, i) => ({
              id: 'proj-' + i,
              tools: [],
              deliverables: [],
              palette: [],
              imageUrl: '',
              behanceEmbedId: '',
              ...p
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Đọc thông tin cá nhân (About Me, ảnh chân dung, email, link...) từ public/content/profile.json.
  useEffect(() => {
    fetch('/content/profile.json')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (data && typeof data === 'object') {
          setProfile((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, []);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  // ADMIN MODE: Mặc định ẩn, chỉ bật khi nhấn vào nút nhỏ ở footer
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const [isEditingProj, setIsEditingProj] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const [newProj, setNewProj] = useState({
    sourcePlatform: "Behance",
    title: "",
    subtitle: "",
    category: "Portrait",
    year: "2026",
    role: "Co-Founder Homnao.Foto & Photographer",
    toolsInput: "Photography, Adobe Creative Cloud, Visual Direction",
    summary: "",
    imageUrl: "",
    behanceLink: "https://www.behance.net/callmeiskay",
    igLink: "https://www.instagram.com/callmeiskay"
  });

  const processDriveUrl = (url) => {
    if (!url) return "";
    if (url.includes("drive.google.com")) {
      const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}=s1600`;
      }
    }
    return url;
  };

  const extractBehanceGalleryId = (url) => {
    if (!url) return "";
    const match = url.match(/behance\.net\/gallery\/(\d+)/i);
    return match ? match[1] : "";
  };

  const categories = useMemo(() => {
    return ["All", "Portrait", "Yearbook", "Event", "Architectural", "Design & Brand Identity"];
  }, []);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") return projects;
    return projects.filter(p => p.category === activeCategory);
  }, [projects, activeCategory]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(profile.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLocalImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setNewProj((prev) => ({ ...prev, imageUrl: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProj.title) return;
    const galleryId = extractBehanceGalleryId(newProj.behanceLink);
    const parsedTools = newProj.toolsInput
      ? newProj.toolsInput.split(",").map((t) => t.trim()).filter(Boolean)
      : ["Photography", "Visual Direction"];

    const processedImg = processDriveUrl(newProj.imageUrl);

    const created = {
      id: "proj-" + Date.now(),
      title: newProj.title,
      subtitle:
        newProj.subtitle ||
        (newProj.sourcePlatform === "Behance"
          ? "Behance Case Study — behance.net/callmeiskay"
          : "Visual Journal — @callmeiskay"),
      category: newProj.category,
      year: newProj.year,
      client:
        newProj.sourcePlatform === "Behance"
          ? "Behance Case Study (@callmeiskay)"
          : "Instagram @callmeiskay",
      role: newProj.role || "Co-Founder Homnao.Foto & Photographer",
      tools: parsedTools,
      summary:
        newProj.summary ||
        "Dự án được trích xuất từ hồ sơ sáng tạo chính thức của Huỳnh Bá Nhật Huy (@callmeiskay).",
      challenge: "Xây dựng ngôn ngữ thị giác tối giản, có chiều sâu câu chuyện và cấu trúc tỷ lệ chuẩn xác.",
      solution: "Kết hợp tư duy hệ thống lưới (Grid System), khoảng trắng tinh tế và quy trình hậu kỳ chuẩn mực.",
      deliverables: ["Full Case Study", "Visual System", "Final Production"],
      palette: ["#141413", "#5A5A55", "#A8A69F", "#EAE8E1"],
      visualType: "editorial",
      imageUrl: processedImg,
      behanceLink: newProj.behanceLink || "https://www.behance.net/callmeiskay",
      behanceEmbedId: galleryId,
      igLink: newProj.igLink || "https://www.instagram.com/callmeiskay"
    };
    setProjects([created, ...projects]);
    setNewProj({
      sourcePlatform: "Behance",
      title: "",
      subtitle: "",
      category: "Portrait",
      year: "2026",
      role: "Co-Founder Homnao.Foto & Photographer",
      toolsInput: "Photography, Adobe Creative Cloud, Visual Direction",
      summary: "",
      imageUrl: "",
      behanceLink: "https://www.behance.net/callmeiskay",
      igLink: "https://www.instagram.com/callmeiskay"
    });
    setIsEditOpen(false);
  };

  const handleDeleteProject = (id) => {
    setProjects(projects.filter((p) => p.id !== id));
    if (selectedProject?.id === id) {
      setSelectedProject(null);
      setIsEditingProj(false);
    }
  };

  const handleStartEdit = (proj) => {
    setEditForm({ ...proj, toolsInput: proj.tools ? proj.tools.join(", ") : "" });
    setIsEditingProj(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editForm) return;
    const parsedTools = editForm.toolsInput
      ? editForm.toolsInput.split(",").map((t) => t.trim()).filter(Boolean)
      : editForm.tools;

    const processedImg = processDriveUrl(editForm.imageUrl);

    const updated = {
      ...editForm,
      imageUrl: processedImg,
      tools: parsedTools
    };

    setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedProject(updated);
    setIsEditingProj(false);
  };

  const handleEditImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEditForm((prev) => ({ ...prev, imageUrl: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const renderMinimalistArtwork = (project, aspectClass = "aspect-[16/10]") => {
    const type = project.visualType || "editorial";
    const strokeColor = isDark ? "#E5E5E0" : "#181818";
    const subtleStroke = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
    const canvasBg = isDark ? "bg-[#151515]" : "bg-[#F0EFEA]";

    if (project.imageUrl) {
      return (
        <div className={`relative w-full ${aspectClass} ${canvasBg} overflow-hidden flex items-center justify-center`}>
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out"
          />
        </div>
      );
    }

    return (
      <div className={`relative w-full ${aspectClass} ${canvasBg} overflow-hidden flex items-center justify-center transition-colors duration-500`}>
        {type === "danang" && (
          <svg className="w-full h-full p-8 sm:p-12" viewBox="0 0 400 250">
            <line x1="40" y1="125" x2="360" y2="125" stroke={subtleStroke} strokeWidth="1" />
            <line x1="200" y1="20" x2="200" y2="230" stroke={subtleStroke} strokeWidth="1" />
            <circle cx="200" cy="125" r="85" fill="none" stroke={subtleStroke} strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="200" cy="125" r="56" fill="none" stroke={strokeColor} strokeWidth="1.2" />
            <circle cx="200" cy="96" r="14" fill="none" stroke="#E63946" strokeWidth="1.5" />
            <path
              d="M 115 142 C 145 108, 175 142, 200 122 C 225 102, 255 142, 285 125"
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 135 158 L 265 158"
              stroke={strokeColor}
              strokeWidth="1"
              strokeOpacity="0.5"
            />
          </svg>
        )}

        {type === "editorial" && (
          <svg className="w-full h-full p-8 sm:p-12" viewBox="0 0 400 250">
            <rect x="90" y="45" width="110" height="160" fill="none" stroke={strokeColor} strokeWidth="1.2" />
            <rect x="200" y="45" width="110" height="160" fill="none" stroke={strokeColor} strokeWidth="1.2" />
            <line x1="112" y1="78" x2="155" y2="78" stroke={strokeColor} strokeWidth="1.5" />
            <line x1="112" y1="90" x2="175" y2="90" stroke={strokeColor} strokeWidth="1" strokeOpacity="0.4" />
            <line x1="112" y1="100" x2="168" y2="100" stroke={strokeColor} strokeWidth="1" strokeOpacity="0.4" />
            <line x1="112" y1="110" x2="160" y2="110" stroke={strokeColor} strokeWidth="1" strokeOpacity="0.4" />
            <text x="112" y="178" fill={strokeColor} fontSize="9" fontFamily="serif" fontStyle="italic" opacity="0.7">
              20
            </text>
            <rect x="222" y="68" width="66" height="88" fill="none" stroke={strokeColor} strokeWidth="1" />
            <circle cx="255" cy="105" r="14" fill="none" stroke={strokeColor} strokeWidth="0.9" opacity="0.6" />
            <path d="M 237 142 C 243 128, 267 128, 273 142" fill="none" stroke={strokeColor} strokeWidth="0.9" opacity="0.6" />
          </svg>
        )}

        {type === "ananas" && (
          <svg className="w-full h-full p-8 sm:p-12" viewBox="0 0 400 250">
            <rect x="75" y="55" width="250" height="140" fill="none" stroke={subtleStroke} strokeWidth="1" />
            <path
              d="M 120 152 L 280 152 C 286 152, 286 164, 278 164 L 122 164 C 114 164, 114 152, 120 152 Z"
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            <path
              d="M 124 152 L 132 106 C 148 106, 162 124, 182 124 L 218 110 L 272 134 C 280 138, 280 152, 274 152"
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            <circle cx="152" cy="134" r="3" fill="#D95326" />
          </svg>
        )}

        {type === "cinema" && (
          <svg className="w-full h-full p-8 sm:p-12" viewBox="0 0 400 250">
            <rect x="60" y="65" width="280" height="120" fill="none" stroke={strokeColor} strokeWidth="1.2" />
            <line x1="153" y1="65" x2="153" y2="185" stroke={subtleStroke} strokeWidth="1" />
            <line x1="246" y1="65" x2="246" y2="185" stroke={subtleStroke} strokeWidth="1" />
            <line x1="60" y1="105" x2="340" y2="105" stroke={subtleStroke} strokeWidth="1" />
            <line x1="60" y1="145" x2="340" y2="145" stroke={subtleStroke} strokeWidth="1" />
            <circle cx="153" cy="125" r="5" fill="none" stroke={strokeColor} strokeWidth="1.4" />
            <line x1="158" y1="125" x2="195" y2="125" stroke={strokeColor} strokeWidth="1.2" />
            <circle cx="200" cy="125" r="5" fill="#D95326" />
            <line x1="205" y1="125" x2="241" y2="125" stroke={strokeColor} strokeWidth="1.2" />
            <circle cx="246" cy="125" r="5" fill="none" stroke={strokeColor} strokeWidth="1.4" />
          </svg>
        )}
      </div>
    );
  };

  const theme = isDark
    ? {
        bg: "bg-[#0F0F0F]",
        surface: "bg-[#161616]",
        text: "text-[#F2F2EE]",
        muted: "text-[#8A8A85]",
        subtle: "text-[#555550]",
        border: "border-[#242424]"
      }
    : {
        bg: "bg-[#F8F8F6]",
        surface: "bg-[#EFECE6]",
        text: "text-[#141413]",
        muted: "text-[#6E6E6A]",
        subtle: "text-[#A3A39E]",
        border: "border-[#E4E3DD]"
      };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-500 font-sans antialiased selection:bg-neutral-800 selection:text-white`}>
      
      {/* HEADER */}
      <header className={`sticky top-0 z-30 ${theme.bg}/90 backdrop-blur-md border-b ${theme.border} transition-colors duration-500`}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12 h-20 flex items-center justify-between">
          <a href="#top" className="group flex items-baseline gap-3">
            <span className="text-sm font-medium tracking-tight">{profile.name}</span>
            <span className={`hidden sm:inline-block text-xs ${theme.muted} font-normal`}>
              — Co-Founder Homnao.Foto
            </span>
          </a>

          <div className="flex items-center gap-7 sm:gap-9 text-xs tracking-wide">
            <nav className="hidden md:flex items-center gap-8">
              <a href="#work" className={`${theme.muted} hover:opacity-100 transition-opacity`}>
                Works
              </a>
              <a href="#about" className={`${theme.muted} hover:opacity-100 transition-opacity`}>
                About Me
              </a>
              {extractBookingUrl(profile.bookingUrl) && (
                <a href="#booking" className={`${theme.muted} hover:opacity-100 transition-opacity`}>
                  {profile.bookingHeading || "Đặt lịch"}
                </a>
              )}
              <a href="#contact" className={`${theme.muted} hover:opacity-100 transition-opacity`}>
                Contact
              </a>
              <a
                href={profile.behanceUrl}
                target="_blank"
                rel="noreferrer"
                className={`${theme.muted} hover:opacity-100 transition-opacity inline-flex items-center gap-1`}
              >
                <span>Behance</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
              <a
                href={profile.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className={`${theme.muted} hover:opacity-100 transition-opacity inline-flex items-center gap-1`}
              >
                <span>IG</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </nav>

            <div className="flex items-center gap-5">
              <button
                onClick={() => setIsDark(!isDark)}
                className={`flex items-center gap-1.5 ${theme.muted} hover:opacity-100 transition-opacity`}
                title="Chuyển đổi giao diện Sáng / Tối"
              >
                <span className={`w-2 h-2 rounded-full ${isDark ? "bg-[#F2F2EE]" : "bg-[#141413]"}`} />
                <span className="font-mono text-[11px] uppercase">{isDark ? "Dark" : "Light"}</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setIsEditOpen(true)}
                  className={`font-mono text-[11px] uppercase ${theme.muted} hover:opacity-100 transition-opacity flex items-center gap-1.5`}
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Edit</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main id="top" className="max-w-6xl mx-auto px-6 sm:px-12">
        
        {/* HERO SECTION */}
        <section className="py-24 sm:py-36">
          <div className="max-w-4xl space-y-10">
            <div className={`font-mono text-xs uppercase tracking-widest ${theme.muted}`}>
              {profile.heroLabel}
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-[68px] font-light tracking-tight leading-[1.08]">
              {profile.name} is a{" "}
              <span className="font-serif italic font-normal">Multimedia</span> &{" "}
              <span className="font-normal">Graphic Designer</span>, Co-Founder Homnao.Foto.
            </h1>

            <p className={`text-base sm:text-lg ${theme.muted} max-w-2xl leading-relaxed font-normal`}>
              {profile.philosophy}
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-8 text-xs font-mono uppercase tracking-widest">
              <a
                href="#work"
                className="inline-flex items-center gap-2 pb-1 border-b border-current hover:opacity-60 transition-opacity"
              >
                <span>Selected Works</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a
                href={profile.behanceUrl}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-2 pb-1 ${theme.muted} hover:opacity-100 transition-opacity`}
              >
                <span>Behance ({profile.behance})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <a
                href={profile.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-2 pb-1 ${theme.muted} hover:opacity-100 transition-opacity`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Instagram ({profile.instagram})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* SELECTED WORKS */}
        <section id="work" className={`py-24 border-t ${theme.border}`}>
          <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 mb-16">
            <div>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight">Selected Works</h2>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`transition-colors ${
                    activeCategory === cat
                      ? "font-medium underline underline-offset-8"
                      : theme.muted
                  }`}
                >
                  {cat}
                </button>
              ))}

              {isAdmin && (
                <button
                  onClick={() => setIsEditOpen(true)}
                  className={`font-mono text-[11px] uppercase px-3 py-1.5 border ${theme.border} inline-flex items-center gap-1.5 ml-2 hover:opacity-75 transition-opacity`}
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add Project</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="group cursor-pointer space-y-5"
              >
                <div className="overflow-hidden">
                  <div className="group-hover:scale-[1.015] transition-transform duration-700 ease-out">
                    {renderMinimalistArtwork(project, "aspect-[16/10]")}
                  </div>
                </div>

                <div className="flex items-baseline justify-between gap-4 pt-1">
                  <div className="space-y-1">
                    <h3 className="text-lg font-normal tracking-tight group-hover:opacity-70 transition-opacity">
                      {project.title}
                    </h3>
                    <p className={`text-xs ${theme.muted} leading-relaxed`}>
                      {project.subtitle}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`font-mono text-xs ${theme.muted} block`}>
                      {project.year}
                    </span>
                    <span className={`text-[11px] ${theme.subtle} hidden sm:block mt-0.5`}>
                      {project.category}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ABOUT ME & CAPABILITIES */}
        <section id="about" className={`py-24 border-t ${theme.border}`}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24 items-center">
            <div className="md:col-span-4 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight">
                {profile.aboutHeading}
              </h2>
              <div className="w-full aspect-[4/5] overflow-hidden flex items-center justify-center relative group">
                {profile.aboutAvatarUrl ? (
                  <img
                    src={profile.aboutAvatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700"
                  />
                ) : (
                  <div className={`w-full h-full ${theme.surface} flex items-center justify-center text-center p-6 ${theme.muted} font-mono text-xs space-y-2`}>
                    <div>
                      <p>Chưa có ảnh chân dung</p>
                      {isAdmin && (
                        <button
                          onClick={() => setIsEditOpen(true)}
                          className="underline block mx-auto mt-2 hover:opacity-100"
                        >
                          + Thêm ảnh chân dung
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-8 space-y-6 max-w-2xl">
              <p className="text-lg sm:text-xl font-light leading-relaxed">
                {profile.aboutLead}
              </p>
              <p className={`text-sm sm:text-base ${theme.muted} leading-relaxed`}>
                {profile.aboutDetail}
              </p>
            </div>
          </div>
        </section>

        {/* BOOKING: chỉ hiện khi đã dán link đặt lịch trong /admin */}
        {extractBookingUrl(profile.bookingUrl) && (
          <section id="booking" className={`py-24 border-t ${theme.border}`}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
              <div className="md:col-span-8 space-y-4">
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight">
                  {profile.bookingHeading || "Đặt lịch"}
                </h2>
                <p className={`text-sm sm:text-base ${theme.muted} leading-relaxed max-w-xl`}>
                  {profile.bookingText}
                </p>
              </div>
              <div className="md:col-span-4 md:text-right">
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="inline-flex items-center gap-2 pb-1 border-b border-current text-xs font-mono uppercase tracking-widest hover:opacity-60 transition-opacity"
                >
                  <span>{profile.bookingButton || "Đặt lịch ngay"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* CONTACT */}
        <section id="contact" className={`py-28 border-t ${theme.border}`}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-end">
            <div className="md:col-span-8 space-y-6">
              <div className={`font-mono text-xs uppercase tracking-widest ${theme.muted}`}>
                Contact & Inquiries
              </div>

              <h2 className="text-3xl sm:text-5xl font-light tracking-tight leading-tight">
                Let’s create something quiet, thoughtful, and enduring.
              </h2>

              <div className="pt-4 flex flex-wrap items-center gap-6">
                <button
                  onClick={handleCopyEmail}
                  className="group inline-flex items-center gap-3 text-lg sm:text-2xl font-light border-b border-current pb-1.5 hover:opacity-60 transition-opacity"
                >
                  <span>{profile.email}</span>
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
                {copied && (
                  <span className="font-mono text-xs text-emerald-500">
                    Copied to clipboard
                  </span>
                )}
              </div>
            </div>

            <div className="md:col-span-4 space-y-4 md:text-right text-xs font-mono">
              <div className={theme.muted}>{profile.status}</div>
              <div className="flex md:justify-end gap-6 pt-2">
                <a
                  href={profile.behanceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline underline-offset-4"
                >
                  Behance ({profile.behance}) ↗
                </a>
                <a
                  href={profile.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline underline-offset-4"
                >
                  Instagram ({profile.instagram}) ↗
                </a>
                <button
                  onClick={() => window.print()}
                  className="hover:underline underline-offset-4"
                >
                  Print CV ↗
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className={`border-t ${theme.border} py-10`}>
        <div className="max-w-6xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className={theme.muted}>
              © {new Date().getFullYear()} {profile.name} — Co-Founder Homnao.Foto
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href={profile.behanceUrl}
              target="_blank"
              rel="noreferrer"
              className={`${theme.muted} hover:opacity-100 transition-opacity`}
            >
              behance.net/callmeiskay
            </a>
            <a
              href={profile.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className={`${theme.muted} hover:opacity-100 transition-opacity`}
            >
              instagram.com/callmeiskay
            </a>
          </div>
        </div>
      </footer>

      {/* BOOKING MODAL */}
      {isBookingOpen && extractBookingUrl(profile.bookingUrl) && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-8"
          onClick={() => setIsBookingOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-3xl h-[85vh] ${theme.bg} ${theme.text} border ${theme.border} shadow-2xl flex flex-col`}
          >
            <div className={`flex items-center justify-between px-5 py-3 border-b ${theme.border} text-xs font-mono`}>
              <span className={theme.muted}>{profile.bookingHeading || "Đặt lịch"}</span>
              <div className="flex items-center gap-4">
                <a
                  href={extractBookingUrl(profile.bookingUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className={`${theme.muted} hover:opacity-100 inline-flex items-center gap-1`}
                >
                  <span>Mở trong tab mới</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
                <button
                  onClick={() => setIsBookingOpen(false)}
                  className="p-1 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <iframe
              src={extractBookingUrl(profile.bookingUrl)}
              title="Đặt lịch"
              className="w-full flex-1 border-0 bg-white"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* CASE STUDY MODAL */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-8 overflow-y-auto"
          onClick={() => {
            setSelectedProject(null);
            setIsEditingProj(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-3xl ${theme.bg} ${theme.text} border ${theme.border} p-6 sm:p-12 my-auto max-h-[90vh] overflow-y-auto space-y-10 shadow-2xl`}
          >
            <div className="flex items-center justify-between border-b border-current/10 pb-5">
              <div className={`font-mono text-xs ${theme.muted}`}>
                {selectedProject.category.toUpperCase()} — {selectedProject.year}
              </div>
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <button
                    onClick={() => {
                      if (isEditingProj) {
                        setIsEditingProj(false);
                      } else {
                        handleStartEdit(selectedProject);
                      }
                    }}
                    className={`font-mono text-xs underline ${theme.muted} hover:opacity-100`}
                  >
                    {isEditingProj ? "Cancel Edit" : "Edit Project"}
                  </button>
                )}
                {selectedProject.behanceLink && (
                  <a
                    href={selectedProject.behanceLink}
                    target="_blank"
                    rel="noreferrer"
                    className={`font-mono text-xs ${theme.muted} hover:opacity-100 inline-flex items-center gap-1`}
                  >
                    <span>Behance</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                )}
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteProject(selectedProject.id)}
                    className="p-1 opacity-40 hover:opacity-100 hover:text-red-500 transition-opacity"
                    title="Xoá dự án này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    setIsEditingProj(false);
                  }}
                  className="p-1 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isEditingProj && editForm && isAdmin ? (
              <form onSubmit={handleSaveEdit} className="space-y-6 text-xs">
                <div className={`font-mono uppercase tracking-wider ${theme.muted}`}>
                  Chỉnh sửa trực tiếp dự án (Admin Only)
                </div>

                <div className="space-y-1">
                  <label className={theme.muted}>Tiêu đề dự án</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className={`w-full px-3 py-2.5 bg-transparent border ${theme.border} focus:outline-none`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={theme.muted}>Danh mục</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className={`w-full px-3 py-2.5 bg-transparent border ${theme.border} focus:outline-none`}
                    >
                      <option value="Portrait" className="text-black">Portrait</option>
                      <option value="Yearbook" className="text-black">Yearbook</option>
                      <option value="Event" className="text-black">Event</option>
                      <option value="Architectural" className="text-black">Architectural</option>
                      <option value="Design & Brand Identity" className="text-black">Design & Brand Identity</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={theme.muted}>Năm thực hiện</label>
                    <input
                      type="text"
                      value={editForm.year}
                      onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                      className={`w-full px-3 py-2.5 bg-transparent border ${theme.border} focus:outline-none`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={theme.muted}>Tiêu đề phụ (Subtitle)</label>
                  <input
                    type="text"
                    value={editForm.subtitle}
                    onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                    className={`w-full px-3 py-2.5 bg-transparent border ${theme.border} focus:outline-none`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={theme.muted}>Vai trò (Role)</label>
                  <input
                    type="text"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className={`w-full px-3 py-2.5 bg-transparent border ${theme.border} focus:outline-none`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={theme.muted}>Công cụ / Phần mềm (Cách nhau bởi dấu phẩy)</label>
                  <input
                    type="text"
                    value={editForm.toolsInput}
                    onChange={(e) => setEditForm({ ...editForm, toolsInput: e.target.value })}
                    className={`w-full px-3 py-2.5 bg-transparent border ${theme.border} focus:outline-none`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={theme.muted}>Tóm tắt (Summary)</label>
                  <textarea
                    rows={3}
                    value={editForm.summary}
                    onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                    className={`w-full px-3 py-2.5 bg-transparent border ${theme.border} focus:outline-none`}
                  />
                </div>

                <div className="space-y-2">
                  <label className={theme.muted}>Ảnh bìa (Tải ảnh mới hoặc dán Link URL / Google Drive)</label>
                  <div className="flex gap-2">
                    <label className={`flex-1 cursor-pointer py-2 px-3 border ${theme.border} flex items-center justify-center gap-2 hover:opacity-75 transition-opacity`}>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chọn ảnh từ máy</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="Hoặc dán URL ảnh / link Google Drive..."
                    value={editForm.imageUrl}
                    onChange={(e) => setEditForm({ ...editForm, imageUrl: processDriveUrl(e.target.value) })}
                    className={`w-full px-3 py-2 bg-transparent border ${theme.border} focus:outline-none`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditingProj(false)}
                    className={`px-4 py-2 border ${theme.border}`}
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 border ${theme.border} font-medium`}
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-4xl font-light tracking-tight">
                    {selectedProject.title}
                  </h3>
                  <p className={`text-sm sm:text-base ${theme.muted}`}>
                    {selectedProject.subtitle}
                  </p>
                </div>

                {selectedProject.behanceEmbedId ? (
                  <div className="space-y-3">
                    <div className={`w-full aspect-[16/10] border ${theme.border} overflow-hidden bg-neutral-900`}>
                      <iframe
                        src={`https://www.behance.net/embed/project/${selectedProject.behanceEmbedId}?ilo0=1`}
                        title={selectedProject.title}
                        className="w-full h-full border-0"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                    <div className={`font-mono text-[11px] ${theme.muted} flex justify-between`}>
                      <span>INTERACTIVE BEHANCE EMBED</span>
                      <a
                        href={selectedProject.behanceLink}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        Open full screen on Behance ↗
                      </a>
                    </div>
                  </div>
                ) : (
                  renderMinimalistArtwork(selectedProject, "aspect-[16/9]")
                )}

                <div className={`grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-y ${theme.border} text-xs`}>
                  <div>
                    <span className={`font-mono uppercase block mb-1 ${theme.muted}`}>Client / Context</span>
                    <span>{selectedProject.client}</span>
                  </div>
                  <div>
                    <span className={`font-mono uppercase block mb-1 ${theme.muted}`}>Role</span>
                    <span>{selectedProject.role}</span>
                  </div>
                  <div className="col-span-2">
                    <span className={`font-mono uppercase block mb-1 ${theme.muted}`}>Tools & Craft</span>
                    <span>{selectedProject.tools.join(" · ")}</span>
                  </div>
                </div>

                <div className="space-y-8 text-sm leading-relaxed">
                  <div>
                    <div className={`font-mono text-xs uppercase mb-2 ${theme.muted}`}>Overview</div>
                    <p>{selectedProject.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <div className={`font-mono text-xs uppercase mb-2 ${theme.muted}`}>Challenge</div>
                      <p className={theme.muted}>{selectedProject.challenge}</p>
                    </div>
                    <div>
                      <div className={`font-mono text-xs uppercase mb-2 ${theme.muted}`}>Approach</div>
                      <p className={theme.muted}>{selectedProject.solution}</p>
                    </div>
                  </div>
                </div>

                <div className={`pt-6 border-t ${theme.border} flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.deliverables.map((item) => (
                      <span
                        key={item}
                        className={`font-mono text-[11px] px-3 py-1 border ${theme.border} ${theme.muted}`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedProject.palette.map((hex) => (
                      <div
                        key={hex}
                        className="w-5 h-5 rounded-full border border-neutral-400/30"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ADMIN CONTROL DRAWER: Chỉ xuất hiện khi bật isAdmin */}
      {isEditOpen && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className={`w-full max-w-md h-full ${theme.bg} ${theme.text} border-l ${theme.border} p-8 overflow-y-auto flex flex-col justify-between shadow-2xl`}>
            <div className="space-y-8">
              <div className={`flex items-center justify-between pb-5 border-b ${theme.border}`}>
                <span className="font-mono text-xs uppercase tracking-widest text-emerald-500 font-bold">
                  Admin Control Center (@callmeiskay)
                </span>
                <button onClick={() => setIsEditOpen(false)} className="opacity-60 hover:opacity-100">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddProject} className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className={`font-mono uppercase ${theme.muted}`}>
                    + Add New Project
                  </span>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Tên dự án..."
                  value={newProj.title}
                  onChange={(e) => setNewProj({ ...newProj, title: e.target.value })}
                  className={`w-full px-3 py-2.5 bg-transparent border ${theme.border} focus:outline-none`}
                />

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newProj.category}
                    onChange={(e) => setNewProj({ ...newProj, category: e.target.value })}
                    className={`px-3 py-2.5 bg-transparent border ${theme.border} focus:outline-none`}
                  >
                    <option value="Portrait" className="text-black">Portrait</option>
                    <option value="Yearbook" className="text-black">Yearbook</option>
                    <option value="Event" className="text-black">Event</option>
                    <option value="Architectural" className="text-black">Architectural</option>
                    <option value="Design & Brand Identity" className="text-black">Design & Brand Identity</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Năm (VD: 2026)"
                    value={newProj.year}
                    onChange={(e) => setNewProj({ ...newProj, year: e.target.value })}
                    className={`px-3 py-2.5 bg-transparent border ${theme.border} focus:outline-none`}
                  />
                </div>

                <input
                  type="text"
                  placeholder="Mô tả ngắn (Subtitle)"
                  value={newProj.subtitle}
                  onChange={(e) => setNewProj({ ...newProj, subtitle: e.target.value })}
                  className={`w-full px-3 py-2.5 bg-transparent border ${theme.border} focus:outline-none`}
                />

                <input
                  type="text"
                  placeholder="Dán link dự án Behance (nếu có)..."
                  value={newProj.behanceLink}
                  onChange={(e) => setNewProj({ ...newProj, behanceLink: e.target.value })}
                  className={`w-full px-3 py-2.5 bg-transparent border ${theme.border} focus:outline-none`}
                />

                <input
                  type="text"
                  placeholder="Công cụ (cách nhau bằng dấu phẩy)..."
                  value={newProj.toolsInput}
                  onChange={(e) => setNewProj({ ...newProj, toolsInput: e.target.value })}
                  className={`w-full px-3 py-2.5 bg-transparent border ${theme.border} focus:outline-none`}
                />

                <textarea
                  rows={3}
                  placeholder="Tóm tắt nội dung dự án..."
                  value={newProj.summary}
                  onChange={(e) => setNewProj({ ...newProj, summary: e.target.value })}
                  className={`w-full px-3 py-2.5 bg-transparent border ${theme.border} focus:outline-none`}
                />

                <div className="space-y-2">
                  <label className={`block ${theme.muted}`}>
                    Ảnh bìa (Tải từ máy / Link Google Drive / Image URL)
                  </label>
                  <div className="flex gap-2">
                    <label className={`flex-1 cursor-pointer py-2 px-3 border ${theme.border} flex items-center justify-center gap-2 hover:opacity-75 transition-opacity`}>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chọn ảnh từ máy</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLocalImageUpload}
                        className="hidden"
                      />
                    </label>
                    {newProj.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setNewProj({ ...newProj, imageUrl: "" })}
                        className={`px-3 border ${theme.border} text-red-500`}
                      >
                        Xoá
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Hoặc dán URL ảnh / link Google Drive..."
                    value={newProj.imageUrl}
                    onChange={(e) => setNewProj({ ...newProj, imageUrl: processDriveUrl(e.target.value) })}
                    className={`w-full px-3 py-2 bg-transparent border ${theme.border} focus:outline-none`}
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-2.5 border ${theme.border} font-mono uppercase tracking-wider hover:opacity-75 transition-opacity flex items-center justify-center gap-2`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project to Portfolio</span>
                </button>
              </form>

              <div className={`space-y-4 pt-6 border-t ${theme.border} text-xs`}>
                <div className={`font-mono uppercase ${theme.muted}`}>About Me & Profile Details</div>
                <div>
                  <label className={`block mb-1 ${theme.muted}`}>Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className={`w-full px-3 py-2 bg-transparent border ${theme.border} focus:outline-none`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 ${theme.muted}`}>Ảnh chân dung (Tách nền PNG / Link Google Drive)</label>
                  <div className="flex gap-2 mb-2">
                    <label className={`flex-1 cursor-pointer py-2 px-3 border ${theme.border} flex items-center justify-center gap-2 hover:opacity-75 transition-opacity`}>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Tải ảnh PNG từ máy</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === "string") {
                              setProfile({ ...profile, aboutAvatarUrl: reader.result });
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="hidden"
                      />
                    </label>
                    {profile.aboutAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => setProfile({ ...profile, aboutAvatarUrl: "" })}
                        className={`px-3 border ${theme.border} text-red-500`}
                      >
                        Xoá
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Hoặc dán URL ảnh / link Google Drive..."
                    value={profile.aboutAvatarUrl}
                    onChange={(e) => setProfile({ ...profile, aboutAvatarUrl: processDriveUrl(e.target.value) })}
                    className={`w-full px-3 py-2 bg-transparent border ${theme.border} focus:outline-none`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 ${theme.muted}`}>Email</label>
                  <input
                    type="text"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className={`w-full px-3 py-2 bg-transparent border ${theme.border} focus:outline-none`}
                  />
                </div>
              </div>
            </div>

            <div className={`pt-6 border-t ${theme.border} text-[11px] font-mono ${theme.muted} flex justify-between`}>
              <span>ADMIN MODE</span>
              <button onClick={() => setIsEditOpen(false)} className="underline">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}