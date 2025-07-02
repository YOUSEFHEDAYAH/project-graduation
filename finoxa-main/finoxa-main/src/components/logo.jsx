import LogoDark from "@/assets/Finoxa-logo-dark.svg";
import LogoLight from "@/assets/Finoxa-logo-light.svg";

export const Logo = ({ size = 24 }) => {
    return (
        <>
            <img
                src={LogoLight}
                alt="Logo"
                className="hidden flex-shrink-0 p-0.5 dark:block"
                width={size}
                height={size}
            />

            <img
                src={LogoDark}
                alt="Logo"
                className="flex-shrink-0 p-0.5 dark:hidden"
                width={size}
                height={size}
            />
        </>
    );
};
