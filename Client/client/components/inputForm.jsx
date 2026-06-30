import { useState } from 'react';
import { useForm } from "react-hook-form";
import imageCompression from 'browser-image-compression';
import { useNavigate } from 'react-router-dom'

export default function InputForm() {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm();

    //states for reducing pic size
    const navigate = useNavigate();
    const [isUploading, setIsUploading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState("");

    const onSubmit = async (data) => {
        console.log("Form Data sent:", data);
        try {
            const response = await fetch('http://localhost:3000/riderform', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to save profile');
            }

            const result = await response.json();
            alert("Profile Saved");
            navigate(`/result/${result.id}`);
        } catch (e) {
            console.error(e);
            alert("Error saving data");
        }
    };

    const handlePhotoSelection = async (event) => {
        const originalFile = event.target.files[0];
        if (!originalFile) return;

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const presetName = import.meta.env.VITE_CLOUDINARY_PRESET_NAME;

        if (!cloudName || !presetName) {
            alert("Cloudinary is not configured. Check your .env file for VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_PRESET_NAME.");
            return;
        }

        const originalSizeMB = originalFile.size / 1024 / 1024;
        console.log("Original Size:", originalSizeMB.toFixed(2), "MB");

        try {
            setIsUploading(true);

            // Only compress if the file is actually larger than the target
            let fileToUpload = originalFile;
            if (originalSizeMB > 0.2) {
                const options = {
                    maxSizeMB: 0.2,
                    maxWidthOrHeight: 800,
                    useWebWorker: true,
                };
                fileToUpload = await imageCompression(originalFile, options);
                console.log("Compressed Size:", (fileToUpload.size / 1024 / 1024).toFixed(2), "MB");
            } else {
                console.log("File already under 0.2 MB, skipping compression.");
            }

            const formData = new FormData();
            formData.append("file", fileToUpload);
            formData.append("upload_preset", presetName);

            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error(`Cloudinary upload failed (${res.status}): ${errBody.error?.message || res.statusText}`);
            }

            const uploadResult = await res.json();
            const uploadedUrl = uploadResult.secure_url;

            setPhotoUrl(uploadedUrl);
            setValue("photo", uploadedUrl);
            alert("Photo uploaded successfully!");

        } catch (error) {
            console.error("Photo processing error:", error);
            alert(`Failed to process image: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register("photo")} />
            <div>
                <label>FirstName</label>
                <input type="text" {...register("firstName", { required: true })} />
                {errors.firstName && <span>This field is required</span>}
            </div>

            <br />

            <div>
                <label>LastName</label>
                <input type="text" {...register("lastName")} />
            </div>

            <br />

            <div>
                <label>Date of Birth</label>
                <input type="date" {...register("dob")} />
            </div>

            <br />
            <div>
                <label>Upload Photo:</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelection}
                    disabled={isUploading}
                />

                {isUploading && <p>Compressing and Uploading...</p>}
                {/*Live Preview of uploaded pic */}

                {photoUrl && (
                    <div style={{ marginTop: '10px' }}>
                        <p>Preview:</p>
                        <img src={photoUrl} alt="Rider" style={{ width: '150px', borderRadius: '10px' }} />
                    </div>
                )}
            </div>

            <div>
                <label>Blood Group:</label>
                <select {...register("bloodGroup")}>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                </select>
            </div>

            <br />

            <div>
                <label>Height</label>
                <input type="text" {...register("height")} />
            </div>

            <br />

            <div>
                <label>Weight</label>
                <input type="number" {...register("weight")} />
            </div>

            <br />

            <div>
                <label>Identification Mark</label>
                <input type="text" {...register("idMark")} />
            </div>

            <br />

            <div>
                <label>Allergies:</label>
                <input type="text" {...register("allergy")} />
            </div>

            <br />

            <div>
                <label>Medical Conditions</label>
                <input type="text" {...register("medicalConditions")} />
            </div>

            <br />

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
            </button>
        </form>
    )
}
