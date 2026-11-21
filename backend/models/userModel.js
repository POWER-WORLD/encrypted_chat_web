const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DEFAULT_AVATAR_URL = 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please provide an email address'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                'Please provide a valid email address',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters'],
        },
        profilePicture: {
            type: String,
            default: DEFAULT_AVATAR_URL,
            trim: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual alias 'pic' for backwards-compatibility with existing frontend and socket events
userSchema.virtual('pic')
    .get(function () {
        return this.profilePicture;
    })
    .set(function (value) {
        this.profilePicture = value;
    });

// Index definition for optimized name searching (email index defined via field unique: true)
userSchema.index({ name: 1 });

// Hash password before saving if modified
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to securely compare candidate password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!enteredPassword || !this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
