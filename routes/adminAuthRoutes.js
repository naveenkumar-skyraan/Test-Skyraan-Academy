import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import db from '../db.js'

const router = express.Router()

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      })
    }

    // 1️⃣ Find admin
    const [rows] = await db.query(
      `
      SELECT 
        a.id,
        a.name,
        a.email,
        a.password,
        a.status,
        r.name AS role
      FROM admins a
      JOIN admin_roles r ON r.id = a.role_id
      WHERE a.email = ? AND a.deleted_at IS NULL
      LIMIT 1
      `,
      [email]
    )

    if (!rows.length) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    const admin = rows[0]

    // 2️⃣ Status check
    if (admin.status !== 'active') {
      return res.status(403).json({
        message: 'Admin account is inactive'
      })
    }

    // 3️⃣ Password check
    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    // 4️⃣ Create JWT
    const token = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    // 5️⃣ Success response
    return res.json({
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    })

  } catch (error) {
    console.error('ADMIN LOGIN ERROR:', error)
    return res.status(500).json({
      message: 'Server error'
    })
  }
})

export default router
