import ProjectDetailPage from "../[id]/page";

export default function ProjectDetailAliasPage() {
    return <ProjectDetailPage params={Promise.resolve({ id: "1" })} />;
}
