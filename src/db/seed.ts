import { eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { addresses, chargeboxes, connectors, ocppTags, users } from './schema';
import { WssProtocol } from 'types/server';
import { hash } from 'bcrypt';
const saltRounds = 10;

export default async function seed(db: MySql2Database) {
  const email: string = 'admin@mail.com';
  // Insert admin data to users table
  const checking = await db.select().from(users).where(eq(users.email, email)).execute();
  if (checking.length === 0) {
    await db.insert(users).values({
      firstName: 'Torsi',
      lastName: 'Ev',
      email: email,
      password: await hash('123456', saltRounds),
      phone: '1234567890',
    });
  }

  // Insert admin ocpp tag
  if ((await db.select().from(ocppTags).where(eq(ocppTags.idTag, '123456')).execute()).length === 0){
    await db.insert(ocppTags).values({
      idTag: '123456',
    });
  }

  // Insert admin adddress
  if ((await db.select().from(addresses).where(eq(addresses.street, 'Jl Telekomunikasi 1, Gedung Selaru')).execute()).length === 0){
    await db.insert(addresses).values({
      street: 'Jl Telekomunikasi 1, Gedung Selaru',
      zipCode: '40257',
      city: 'Kabupaten Bandung',
      country: 'Indonesia',
    });
  }

  // Insert addresses chargeboxes
  if ((await db.select().from(addresses).where(eq(addresses.street, 'Jl Telekomunikasi 1, Gedung Telkom University Landmark Tower')).execute()).length === 0) {
    const chargeBoxesAddress = await db.insert(addresses).values({
      street: 'Jl Telekomunikasi 1, Gedung Telkom University Landmark Tower',
      zipCode: '40257',
      city: 'Kabupaten Bandung',
      country: 'Indonesia',
    });
  
    // Insert data to chargeboxes
    const chargeBoxesTable = await db.insert(chargeboxes).values({
      addressId: chargeBoxesAddress[0].insertId,
      identifier: '123',
      ocppProtocol: WssProtocol.OCPP16,
      locationLatitude: '38.8958',
      locationLongitude: '-132.4095',
    });
  
    // Insert data to connectorsTable
    await db.insert(connectors).values({
      chargeboxId: chargeBoxesTable[0].insertId,
      connectorId: chargeBoxesTable[0].insertId,
    });
  }

  //Update user data with ocpp tag id and address id
  // await db
  //   .update(users)
  //   .set({
  //     ocppTagId: ocppTagsTable[0].insertId,
  //     addressId: addressesTable[0].insertId,
  //   })
  //   .where(eq(users.id, usersTable[0].insertId));
}
