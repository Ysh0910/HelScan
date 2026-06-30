import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import { createRider } from '../api/rider';

async function uploadToCloudinary(file) {
    const cloudName  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const presetName = import.meta.env.VITE_CLOUDINARY_PRESET_NAME;

    if (!cloudName || !presetName) {
        throw new Error('Cloudinary is not configured. Check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_PRESET_NAME in .env');
    }

    const sizeMB = file.size / 1024 / 1024;
    let fileToUpload = file;

    if (sizeMB > 0.2) {
        fileToUpload = await imageCompression(file, {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 800,
            useWebWorker: true,
        });
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('upload_preset', presetName);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Cloudinary upload failed (${res.status}): ${err.error?.message || res.statusText}`);
    }

    const data = await res.json();
    return data.secure_url;
}

export default function InputForm() {
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();
    const [isUploading, setIsUploading] = useState(false);
    const [photoUrl, setPhotoUrl]       = useState('');

    const onSubmit = async (data) => {
        try {
            const result = await createRider(data);
            navigate(`/result/${result.id}`);
        } catch (e) {
            console.error(e);
            alert('Error saving profile: ' + e.message);
        }
    };

    const handlePhotoSelection = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            setPhotoUrl(url);
            setValue('photo', url);
        } catch (error) {
            console.error(error);
            alert('Failed to upload photo: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 16px', fontFamily: 'sans-serif' }}>
            <h2>Create Your Emergency Medical Profile</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input type="hidden" {...register('photo')} />

                {/* ── Personal ── */}
                <section>
                    <h3>Personal Details</h3>

                    <Field label="First Name" required>
                        <input type="text" {...register('firstName', { required: true })} />
                        {errors.firstName && <span style={{ color: 'red' }}>Required</span>}
                    </Field>

                    <Field label="Last Name">
                        <input type="text" {...register('lastName')} />
                    </Field>

                    <Field label="Date of Birth">
                        <input type="date" {...register('dob')} />
                    </Field>

                    <Field label="Photo">
                        <input type="file" accept="image/*" onChange={handlePhotoSelection} disabled={isUploading} />
                        {isUploading && <p>Uploading...</p>}
                        {photoUrl && <img src={photoUrl} alt="Preview" style={{ width: 120, marginTop: 8, borderRadius: 8 }} />}
                    </Field>

                    <Field label="Blood Group" required>
                        <select {...register('bloodGroup', { required: true })}>
                            {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => (
                                <option key={bg} value={bg}>{bg}</option>
                            ))}
                        </select>
                        {errors.bloodGroup && <span style={{ color: 'red' }}>Required</span>}
                    </Field>

                    <Field label="Height (cm)">
                        <input type="text" {...register('height')} />
                    </Field>

                    <Field label="Weight (kg)">
                        <input type="number" {...register('weight')} />
                    </Field>

                    <Field label="Identification Mark">
                        <input type="text" {...register('identificationMark')} />
                    </Field>
                </section>

                {/* ── Medical ── */}
                <section>
                    <h3>Medical Information</h3>

                    <Field label="Allergies">
                        <input type="text" placeholder="e.g. Penicillin, Pollen" {...register('allergies')} />
                    </Field>

                    <Field label="Medical Conditions">
                        <input type="text" placeholder="e.g. Diabetes, Hypertension" {...register('medicalConditions')} />
                    </Field>

                    <Field label="Current Medications">
                        <input type="text" placeholder="e.g. Blood thinners, Insulin" {...register('currentMedications')} />
                    </Field>

                    <Field label="Previous Surgeries / Implants">
                        <input type="text" placeholder="e.g. Pacemaker, Metal rod in left leg" {...register('previousSurgeriesOrImplants')} />
                    </Field>

                    <Field label="">
                        <label>
                            <input type="checkbox" {...register('organDonor')} />{' '}Organ Donor
                        </label>
                    </Field>

                    <Field label="">
                        <label>
                            <input type="checkbox" {...register('bloodDonorCard')} />{' '}Blood Donor Card Holder
                        </label>
                    </Field>
                </section>

                {/* ── Emergency Contacts ── */}
                <section>
                    <h3>Emergency Contacts</h3>

                    {[0, 1].map((i) => (
                        <fieldset key={i} style={{ marginBottom: 12, padding: '12px', border: '1px solid #ddd', borderRadius: 4 }}>
                            <legend>Contact {i + 1}{i === 1 ? ' (Backup)' : ''}</legend>
                            <Field label="Name">
                                <input type="text" {...register(`emergencyContacts[${i}].name`)} />
                            </Field>
                            <Field label="Phone">
                                <input type="tel" {...register(`emergencyContacts[${i}].phone`)} />
                            </Field>
                            <Field label="Relation">
                                <input type="text" placeholder="e.g. Father, Spouse" {...register(`emergencyContacts[${i}].relation`)} />
                            </Field>
                        </fieldset>
                    ))}
                </section>

                {/* ── Insurance ── */}
                <section>
                    <h3>Insurance</h3>

                    <Field label="Provider Name">
                        <input type="text" placeholder="e.g. Star Health, HDFC Ergo" {...register('insurance.providerName')} />
                    </Field>

                    <Field label="Policy Number">
                        <input type="text" placeholder="Alphanumeric policy ID" {...register('insurance.policyNumber')} />
                    </Field>
                </section>

                {/* ── Vehicle & Location ── */}
                <section>
                    <h3>Vehicle &amp; Location</h3>

                    <Field label="Vehicle Registration">
                        <input type="text" placeholder="e.g. KA-01-AB-1234" {...register('vehicleRegistration')} />
                    </Field>

                    <Field label="Vehicle Model">
                        <input type="text" placeholder="e.g. Royal Enfield Classic 350" {...register('vehicleModel')} />
                    </Field>

                    <Field label="Home City">
                        <input type="text" placeholder="e.g. Bangalore" {...register('homeCity')} />
                    </Field>
                </section>

                <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    style={{
                        marginTop: 16,
                        padding: '12px 32px',
                        fontSize: 16,
                        cursor: 'pointer',
                        backgroundColor: '#cc0000',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                    }}
                >
                    {isSubmitting ? 'Saving...' : 'Save Profile'}
                </button>
            </form>
        </div>
    );
}

// Tiny layout helper — keeps each field consistent without a CSS file
function Field({ label, required, children }) {
    return (
        <div style={{ marginBottom: 12 }}>
            {label && (
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                    {label}{required && <span style={{ color: 'red' }}> *</span>}
                </label>
            )}
            {children}
        </div>
    );
}
