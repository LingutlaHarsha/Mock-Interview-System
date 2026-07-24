import { Link } from "react-router-dom";

function ProfileAlert({ profile }) {

    const profileIncomplete =
        !profile.full_name ||
        !profile.roll_number ||
        !profile.branch ||
        !profile.phone ||
        !profile.cgpa ||
        !profile.skills ||
        !profile.resume;

    if (!profileIncomplete) return null;

    return (
        <div
            className="alert alert-danger d-flex justify-content-between align-items-center shadow-sm"
            role="alert"
        >
            <div>
                <strong>⚠ Profile Incomplete!</strong>
                <br />
                Please complete your profile and upload your resume before applying for interview slots.
            </div>

            <Link
                to="/student/profile"
                className="btn btn-light btn-sm"
            >
                Complete Now
            </Link>
        </div>
    );
}

export default ProfileAlert;