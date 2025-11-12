import React, { useEffect, useState } from 'react'
import { Box, Heading, Text, Button, Stack } from '@chakra-ui/react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [health, setHealth] = useState(null)
  const [hello, setHello] = useState(null)

  async function fetchHealth() {
    const r = await fetch(`${API_URL}/api/health`)
    setHealth(await r.json())
  }

  async function fetchHello() {
    const r = await fetch(`${API_URL}/api/hello`)
    setHello(await r.json())
  }

  useEffect(() => { fetchHealth() }, [])

  return (
    <Box p={8}>
      <Heading mb={4}>One-o-One – Minimal Frontend ✅</Heading>
      <Stack spacing={3}>
        <Text>API_URL: {API_URL}</Text>
        <Text>Health: {health ? JSON.stringify(health) : 'loading...'}</Text>
        <Button colorScheme="teal" onClick={fetchHello}>Call /api/hello</Button>
        <Text>Response: {hello ? JSON.stringify(hello) : '—'}</Text>
      </Stack>
    </Box>
  )
}
