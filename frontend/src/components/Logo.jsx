export const Logo = ({ size = 40, withText = true, className = "" }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <img
      src="https://customer-assets-agu9un31.emergentagent.net/job_biolinks-pro-3/artifacts/z8d11noa_logoleamse.jpeg"
      alt="LEAMSE"
      width={size}
      height={size}
      className="rounded-lg object-cover"
      style={{ width: size, height: size }}
    />
    {withText && (
      <span className="font-display text-lg font-extrabold tracking-tight">LEAMSE</span>
    )}
  </div>
);
