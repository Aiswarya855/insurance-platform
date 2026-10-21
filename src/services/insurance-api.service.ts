import axios from "axios";

export const getInsurancePremium = async (
    vehicleType: string,
    coverageAmount: number
) => {
    try {
        const response = await axios.post(
            "https://jsonplaceholder.typicode.com/posts",
            {
                vehicleType,
                coverageAmount,
            }
        );

        return {
            success: true,
            externalReferenceId: response.data.id,
            premium: coverageAmount * 0.018,
        };
    } catch (error) {
        console.error("INSURANCE API ERROR:", error);

        throw new Error("INSURANCE_API_FAILED");
    }
};