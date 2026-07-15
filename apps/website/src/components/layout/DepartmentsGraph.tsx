import { useEffect, useMemo, useRef } from "react";
import {
  darkTheme,
  GraphCanvas,
  GraphCanvasRef,
  GraphEdge,
  GraphNode,
  useSelection,
} from "reagraph";

export default function DepartmentsGraph() {
  const nodes = [
    { id: "root", label: "رئیس و مسئول فنی کلینیک" },

    { id: "public", label: "مدیریت روابط عمومی و بین‌الملل" },
    { id: "finance", label: "مدیریت امور مالی" },
    { id: "internal", label: "مدیریت داخلی کلینیک" },
    { id: "therapy", label: "دپارتمان‌های درمان و مشاوره" },
    { id: "research", label: "دپارتمان پژوهش" },
    { id: "education", label: "دپارتمان آموزش" },
    { id: "assessment", label: "مرکز تست و ارزیابی" },

    // روابط عمومی
    { id: "media", label: "واحد رسانه" },
    { id: "international", label: "واحد بین‌الملل" },

    // مالی
    { id: "accounting", label: "حسابداری" },

    // داخلی کلینیک
    { id: "admin", label: "اداری" },
    { id: "support", label: "پشتیبانی" },
    { id: "reception", label: "پذیرش" },
    { id: "services", label: "خدمات" },

    // آموزش
    { id: "generalEdu", label: "واحد آموزش عمومی" },
    { id: "proEdu", label: "واحد آموزش تخصصی" },

    // درمان و مشاوره
    { id: "industrial", label: "روانشناسی صنعتی سازمانی" },
    { id: "consulting", label: "مشاوره تحصیلی و شغلی" },
    { id: "art", label: "هنر درمانی و بازی درمانی" },
    { id: "family", label: "زوج درمانی و خانواده درمانی" },
    { id: "psychotherapy", label: "روان‌درمانی فردی و گروهی" },
    { id: "speech", label: "گفتار درمانی" },
    { id: "neuro", label: "عصب‌درمانی (نوروفیدبک)" },
    { id: "medicine", label: "دارودرمانی (روانپزشکی)" },
    { id: "crisis", label: "مددکاری و مداخله در بحران" },

    // زیرمجموعه خانواده درمانی
    { id: "sexual", label: "واحد درمان‌های شناختی رفتاری و زوج سوم" },
    { id: "analysis", label: "واحد درمان‌های روان‌تحلیلی و روان‌پویشی" },
    { id: "health", label: "واحد روانشناسی سلامت" },

    // زیرمجموعه دارودرمانی
    { id: "suicide", label: "واحد مداخله در سوگ، ترومـا، خودکشی" },
    {
      id: "addiction",
      label: "واحد روانپزشکی اعتیاد (وابستگی به مواد و اعتیادهای رفتاری)",
    },
    {
      id: "social",
      label: "واحد مددکاری اجتماعی (پیگیری و پشتیبانی خدمات بالینی)",
    },
  ];

  const edges = [
    // Root to main deps
    { id: "e1", source: "root", target: "public" },
    { id: "e2", source: "root", target: "finance" },
    { id: "e3", source: "root", target: "internal" },
    { id: "e4", source: "root", target: "therapy" },
    { id: "e5", source: "root", target: "research" },
    { id: "e6", source: "root", target: "education" },
    { id: "e7", source: "root", target: "assessment" },

    // روابط عمومی
    { id: "e8", source: "public", target: "media" },
    { id: "e9", source: "public", target: "international" },

    // مالی
    { id: "e10", source: "finance", target: "accounting" },

    // داخلی کلینیک
    { id: "e11", source: "internal", target: "admin" },
    { id: "e12", source: "internal", target: "support" },
    { id: "e13", source: "internal", target: "reception" },
    { id: "e14", source: "internal", target: "services" },

    // آموزش
    { id: "e15", source: "education", target: "generalEdu" },
    { id: "e16", source: "education", target: "proEdu" },

    // درمان و مشاوره
    { id: "e17", source: "therapy", target: "industrial" },
    { id: "e18", source: "therapy", target: "consulting" },
    { id: "e19", source: "therapy", target: "art" },
    { id: "e20", source: "therapy", target: "family" },
    { id: "e21", source: "therapy", target: "psychotherapy" },
    { id: "e22", source: "therapy", target: "speech" },
    { id: "e23", source: "therapy", target: "neuro" },
    { id: "e24", source: "therapy", target: "medicine" },
    { id: "e25", source: "therapy", target: "crisis" },

    // زیرمجموعه خانواده درمانی
    { id: "e26", source: "family", target: "sexual" },
    { id: "e27", source: "family", target: "analysis" },
    { id: "e28", source: "family", target: "health" },

    // زیرمجموعه دارودرمانی
    { id: "e29", source: "medicine", target: "suicide" },
    { id: "e30", source: "medicine", target: "addiction" },
    { id: "e31", source: "medicine", target: "social" },
  ];

  const graphRef = useRef<GraphCanvasRef | null>(null);
  const [nodess, edgess] = useMemo(() => {
    const n: GraphNode[] = [...nodes];
    const e: GraphEdge[] = [...edges];
    return [n, e];
  }, [nodes, edges]);
  const {
    selections,
    actives,
    onNodeClick,
    onCanvasClick,
    onNodePointerOver,
    onNodePointerOut,
  } = useSelection({
    ref: graphRef,
    nodes,
    edges,
    pathSelectionType: "out",
  });

  useEffect(() => {
    graphRef.current?.centerGraph(["root"])
  }, [])

  return (
    <GraphCanvas
      selections={selections}
      actives={actives}
      ref={graphRef}
      nodes={nodess}
      edges={edgess}
      theme={darkTheme}
      draggable
      edgeInterpolation="curved"
      onCanvasClick={onCanvasClick}
      onNodeClick={onNodeClick}
      onNodePointerOut={onNodePointerOver}
      onNodePointerOver={onNodePointerOut}
    />
  );
}
