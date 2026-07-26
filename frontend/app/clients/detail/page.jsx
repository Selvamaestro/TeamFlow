import ClientDetailPage from "../[id]/page";

export default function ClientDetailAliasPage() {
    return <ClientDetailPage params={Promise.resolve({ id: "1" })} />;
}
