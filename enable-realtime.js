const { Client } = require('pg')

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.ujlkqpjwibkxakqsncrb:Demonop%40321123@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
  })

  try {
    await client.connect()
    console.log('Connected to PG. Enabling Realtime...')
    await client.query(`alter publication supabase_realtime add table "ExpenseComment";`)
    console.log('Enabled!')
  } catch (error) {
    if (error.message.includes('already')) {
      console.log('Already enabled')
    } else {
      console.error(error)
    }
  } finally {
    await client.end()
  }
}
main()
