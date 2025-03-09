const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { 
    type: String, 
    default: function() {
      // Generate a default avatar based on the first letter of the name
      return `https://ui-avatars.com/api/?name=${this.name.charAt(0)}&background=random`;
    }
  },
  status: { 
    type: String, 
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  },
  lastSeen: { 
    type: Date, 
    default: Date.now 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

const user = mongoose.model("user", userSchema);

module.exports = {
  user,
};
