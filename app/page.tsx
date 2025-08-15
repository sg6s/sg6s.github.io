import Link from 'next/link'

function Home() {
  return (
    <ul>
      <li>
        <Link href="/games">
          Games
        </Link>
      </li>
    </ul>
  )
}

export default Home