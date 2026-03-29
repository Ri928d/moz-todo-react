import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getProfile, updateProfile } from "../services/api";

const CLOUDINARY_UPLOAD_URL = (cloudName) =>
  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

export default function Profile() {
  const { isLoggedIn, username } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [email, setEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setError("");
        const profile = await getProfile();
        setEmail(profile.email || "");
        setImageUrl(profile.image_url || "");
        setImagePublicId(profile.image_public_id || "");
      } catch (err) {
        setError("Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isLoggedIn]);

  const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary is not configured.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(CLOUDINARY_UPLOAD_URL(cloudName), {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Cloudinary upload failed.");
    }

    return response.json();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setStatus("");
    setUploading(true);

    try {
      const uploadResult = await uploadToCloudinary(file);
      setImageUrl(uploadResult.secure_url || "");
      setImagePublicId(uploadResult.public_id || "");
      setStatus("Image uploaded. Save profile to keep changes.");
    } catch (err) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("");
    setSaving(true);

    try {
      const payload = {
        email,
        image_url: imageUrl,
        image_public_id: imagePublicId,
      };
      const updated = await updateProfile(payload);
      setEmail(updated.email || "");
      setImageUrl(updated.image_url || "");
      setImagePublicId(updated.image_public_id || "");
      setStatus("Profile updated successfully.");
    } catch (err) {
      const message = err.response?.data
        ? JSON.stringify(err.response.data)
        : "Unable to update profile.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", background: "white", color: "black" }}>
        <h1>Profile</h1>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div style={{ padding: "40px", background: "white", color: "black" }}>
        <h1>Profile</h1>
        <p>
          Please <Link to="/login">log in</Link> to view your profile.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", background: "white", color: "black" }}>
      <h1 style={{ marginBottom: "12px" }}>User Profile</h1>
      <p style={{ marginBottom: "24px", fontSize: "18px" }}>
        Manage your account details and optional profile image.
      </p>

      {status && (
        <p
          style={{
            background: "#e8f5e9",
            color: "#2e7d32",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "16px",
          }}
        >
          {status}
        </p>
      )}

      {error && (
        <p
          style={{
            background: "#ffebee",
            color: "#c62828",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "16px",
          }}
        >
          {error}
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: "24px",
          alignItems: "start",
          maxWidth: "900px",
        }}
      >
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "20px",
            textAlign: "center",
            background: "#fafafa",
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Profile"
              style={{
                width: "140px",
                height: "140px",
                objectFit: "cover",
                borderRadius: "50%",
                marginBottom: "12px",
              }}
            />
          ) : (
            <div
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                background: "#ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px auto",
                fontSize: "36px",
                fontWeight: "bold",
                color: "#555",
              }}
            >
              {username ? username.charAt(0).toUpperCase() : "U"}
            </div>
          )}

          <p style={{ margin: 0, fontWeight: "bold" }}>{username}</p>
        </div>

        <form
          onSubmit={handleSave}
          style={{
            display: "grid",
            gap: "16px",
            maxWidth: "600px",
          }}
        >
          <div>
            <label>Username</label>
            <input
              type="text"
              value={username || ""}
              disabled
              style={{ padding: "12px", width: "100%", background: "#f5f5f5" }}
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{ padding: "12px", width: "100%" }}
            />
          </div>

          <div>
            <label>Profile Image</label>
            <input
              type="file"
              name="profile_image"
              accept="image/*"
              onChange={handleFileChange}
              style={{ padding: "12px", width: "100%" }}
            />
          </div>

          <button
            type="submit"
            disabled={uploading || saving}
            style={{
              padding: "12px",
              width: "180px",
              background: uploading || saving ? "#999" : "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: uploading || saving ? "not-allowed" : "pointer",
            }}
          >
            {uploading ? "Uploading..." : saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}