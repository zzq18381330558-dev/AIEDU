import { ContentCreateForm } from "@/components/content/content-create-form";
import { ContentTabs } from "@/components/content/content-tabs";
import { requireUser } from "@/lib/session";

export default async function NewContentPage() {
  await requireUser("/content");
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h1 className="text-2xl font-semibold text-ink">新建内容</h1>
        <p className="mt-2 text-sm text-muted">创建内容后可使用 AI 初稿、提交审核、发布到校区并导出 Word/PDF。</p>
      </section>
      <ContentTabs />
      <ContentCreateForm />
    </div>
  );
}
