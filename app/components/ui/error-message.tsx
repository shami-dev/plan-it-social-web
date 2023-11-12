type ErrorProps = {
  children: React.ReactNode;
};

export function ErrorMessage({ children }: ErrorProps) {
  return (
    <div className="m-6 flex items-center justify-center">
      <div
        className="relative w-auto justify-center self-center rounded border border-red-600 bg-red-100 px-4 py-3 text-center"
        role="alert"
      >
        <div className="block md:inline font-medium">{children}</div>
      </div>
    </div>
  );
}
