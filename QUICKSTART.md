# RemZy - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Start Development Server
```bash
pnpm dev
```

The application will open at `http://localhost:5173`

### Step 3: Create Your First Account

#### Option A: Patient Account
1. Click "Sign Up"
2. Enter username and password
3. Click "Sign Up"
4. Select "Patient Mode"
5. Complete setup form
6. Get your linking code

#### Option B: Caregiver Account
1. Click "Sign Up"
2. Enter username and password
3. Click "Sign Up"
4. Select "Caregiver Mode"
5. Enter patient's linking code
6. Start monitoring

## 📱 Key Features to Try

### For Patients
- **Emergency Button**: Large red button on dashboard
- **AI Companion**: Click "Talk to AI Companion" to chat
- **Tasks**: View your daily tasks
- **Contacts**: Manage people you know

### For Caregivers
- **Dashboard**: See all linked patients
- **Alerts**: View recent alerts
- **Patient Info**: Click on patient cards for details

## 🔗 Device Linking

### Patient Side
1. Complete patient setup
2. You'll see a QR code and 8-character code
3. Share this code with your caregiver

### Caregiver Side
1. Complete caregiver setup
2. Enter the 8-character code from patient
3. Click "Link Patient"
4. You're now connected!

## 🎨 What You'll See

### Patient Mode
- Calming blue and green colors
- Large, easy-to-tap buttons
- Simple, clear interface
- Emergency button always visible

### Caregiver Mode
- Professional gray and white design
- Information-dense dashboard
- Real-time alerts
- Patient management tools

## 🔒 Security Notes

- First user becomes admin automatically
- Device mode locks after selection (for security)
- All data is encrypted
- Only linked caregivers can see patient data

## 📚 Need More Help?

- **Setup Issues**: See README.md
- **User Guide**: See USER_GUIDE.md
- **Technical Details**: See ARCHITECTURE.md
- **Deployment**: See DEPLOYMENT.md

## 🛠️ Common Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linter
pnpm lint
```

## 🌐 Environment Variables

The application is pre-configured with Supabase. No additional setup needed!

If you need to customize:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## ✅ Checklist

- [ ] Dependencies installed (`pnpm install`)
- [ ] Development server running (`pnpm dev`)
- [ ] Created first account (becomes admin)
- [ ] Tested patient mode
- [ ] Tested caregiver mode
- [ ] Tested device linking
- [ ] Explored AI companion
- [ ] Checked dashboard features

## 🎯 What's Working

✅ User registration and login
✅ Patient mode with setup
✅ Caregiver mode with setup
✅ Device linking via QR code
✅ AI companion chat
✅ Dashboard for both modes
✅ Alert system
✅ Database operations
✅ Responsive design

## 🔮 Ready for Enhancement

The following features have database support and are ready for expansion:
- Task management (full CRUD ready)
- Known faces/contacts (database ready)
- Health monitoring (metrics tracking ready)
- Activity logs (comprehensive logging ready)
- Real AI integration (UI ready)
- Face recognition (database ready)

## 💡 Tips

1. **First User**: The first person to sign up becomes admin
2. **Mode Selection**: Choose carefully - mode locks after setup
3. **Linking Code**: 8 characters, case-sensitive
4. **Emergency Button**: Always visible on patient dashboard
5. **AI Companion**: Uses simulated responses (ready for real AI API)

## 🚀 Deploy to Production

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically
4. Done!

### Netlify
1. Push code to GitHub
2. Connect repository to Netlify
3. Deploy automatically
4. Done!

## 📞 Support

- Questions? Check USER_GUIDE.md
- Technical? Check ARCHITECTURE.md
- Deployment? Check DEPLOYMENT.md

---

**Ready to start? Run `pnpm dev` and open http://localhost:5173**

🎉 **Welcome to RemZy!**
