import { useState } from "react";
import { Check, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { client } from "@/api/client";
import { Button } from "@/shared/primitives";
import { cn } from "@/lib/utils";
import useNameValidatorAndUpdater from "./hooks/use-name-validator-and-updater";
import PhotoSelector from "./components/photo-selector";
import { SetupInput } from "./components/setup-input";

type SetupStep = "displayName" | "username" | "photo";

export function AccountSetupPage() {
    const { user, header, getMe } = useAuth();
    const [step, setStep] = useState<SetupStep>("displayName");
    const [displayName, setDisplayName] = useState(user?.display_name || "");

    const {
        username,
        validateName,
        validationStatus,
        updateName,
        usernameUpdateStatus,
    } = useNameValidatorAndUpdater();

    const handleContinue = async () => {
        if (step === "displayName") {
            // Fire-and-forget API call to update display name
            if (displayName.trim() && user?.id) {
                client.users["display-name"]
                    .$put(
                        { json: { display_name: displayName.trim() } },
                        { headers: header }
                    )
                    .catch((error: unknown) => {
                        console.error("Failed to update display name:", error);
                    });
            }
            setStep("username");
            return;
        }

        if (step === "username") {
            await updateName();
            setStep("photo");
            return;
        }

        if (step === "photo") {
            await getMe();
        }
    };

    const isContinueDisabled = () => {
        if (step === "displayName") return !displayName.trim();
        if (step === "username")
            return (
                usernameUpdateStatus === "loading" ||
                validationStatus !== "valid"
            );
        return false;
    };

    const continueLabel =
        step === "username" && usernameUpdateStatus === "loading"
            ? "Updating"
            : "Continue";

    return (
        <div className="w-full h-[100dvh] relative bg-surface-primary overflow-hidden flex flex-col justify-between px-9 py-16">
            {/*Title*/}
            <div className="grid">
                <h1
                    className={cn(
                        "typo-heading-1 text-content-primary uppercase transition-opacity col-start-1 row-start-1",
                        step === "displayName" ? "opacity-100" : "opacity-0"
                    )}
                >
                    What's your<br />
                    name?
                </h1>

                <h1
                    className={cn(
                        "typo-heading-1 text-content-primary uppercase transition-opacity col-start-1 row-start-1",
                        step === "username" ? "opacity-100" : "opacity-0"
                    )}
                >
                    Choose your<br />
                    username
                </h1>

                <h1
                    className={cn(
                        "typo-heading-1 text-content-primary uppercase transition-opacity col-start-1 row-start-1",
                        step === "photo" ? "opacity-100" : "opacity-0"
                    )}
                >
                    Choose your<br />
                    photo
                </h1>
            </div>


            <div className="self-center grid justify-center w-full">
                <SetupInput
                    inputSize="lg"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    autoCapitalize="words"
                    autoCorrect="off"
                    autoFocus
                    maxLength={50}
                    shrink={step !== "displayName"}
                    containerClassName="self-center w-full"
                    style={{
                        transform: step === "displayName" ? 'translateY(0)' : 'translateY(-2rem)',
                        opacity: step === "displayName" ? 1 : 0,
                        transition: 'width 300ms ease, transform 300ms ease 250ms, opacity 300ms ease 250ms',
                    }}
                />
            </div>

            <PhotoSelector isActive={step === "photo"} />

            {/* Step 1: Display Name */}

            {/* <SetupInput
                            inputSize="lg"
                            onChange={(e) => validateName(e.target.value)}
                            placeholder="username"
                            autoCapitalize="none"
                            autoCorrect="off"
                            maxLength={30}
                            disabled={step === "photo"}
                            right={
                                step !== "photo" ? (
                                    <div
                                        className={cn(
                                            "w-6 h-6 flex items-center justify-center transition-opacity duration-300",
                                            validationStatus === "idle"
                                                ? "opacity-0"
                                                : "opacity-100"
                                        )}
                                    >
                                        {validationStatus === "valid" && (
                                            <Check className="w-6 h-6 text-brand-green" />
                                        )}
                                        {(validationStatus === "invalid" ||
                                            validationStatus === "error") && (
                                                <X className="w-6 h-6 text-brand-red" />
                                            )}
                                    </div>
                                ) : null
                            }
                        /> */}
            <div className="self-end">
                <Button onClick={handleContinue} disabled={isContinueDisabled()}>
                    {continueLabel}
                </Button>
            </div>
        </div>
    );
}
