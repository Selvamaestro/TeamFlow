import EmployeeLayout from "./EmployeeLayout";

export default function ComingSoon({ title, icon }) {
  return (
    <EmployeeLayout title={title}>
      <div className="flex flex-col items-center justify-center text-center bg-white border border-outline-variant rounded-[16px] p-16 card-shadow">
        <span className="material-symbols-outlined text-primary text-5xl mb-4">{icon}</span>
        <h3 className="font-headline-md text-headline-md text-primary mb-2">{title}</h3>
        <p className="font-body-md text-on-surface-variant max-w-md">
          This page isn't built yet — it wasn't part of the four mockups we started from. The
          backend route is ready, so it can be wired up whenever you're ready to design it.
        </p>
      </div>
    </EmployeeLayout>
  );
}
