// Quick script to manually upgrade pilot LVT7FG and check rank configuration
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || '';

async function fixRankUpgrade() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get collections
        const Pilot = mongoose.connection.collection('pilots');
        const Rank = mongoose.connection.collection('ranks');

        // 1. Check pilot LVT7FG
        const pilot = await Pilot.findOne({ pilot_id: 'LVT7FG' });
        if (!pilot) {
            console.log('❌ Pilot LVT7FG not found');
            return;
        }

        console.log('\n📊 Pilot LVT7FG Status:');
        console.log(`   Current Rank: ${pilot.rank}`);
        console.log(`   Total Hours: ${pilot.total_hours || 0}`);
        console.log(`   Transfer Hours: ${pilot.transfer_hours || 0}`);
        console.log(`   Combined Hours: ${(pilot.total_hours || 0) + (pilot.transfer_hours || 0)}`);
        console.log(`   Total Flights: ${pilot.total_flights || 0}`);

        // 2. Check rank configuration
        const ranks = await Rank.find({}).sort({ order: 1 }).toArray();
        console.log('\n📋 Rank Configuration:');
        ranks.forEach(rank => {
            console.log(`   ${rank.order}. ${rank.name}: ${rank.requirement_hours}h, ${rank.requirement_flights} flights, auto_promote: ${rank.auto_promote}`);
        });

        // 3. Find First Officer rank
        const firstOfficerRank = ranks.find(r => r.name === 'First Officer');
        if (!firstOfficerRank) {
            console.log('\n❌ First Officer rank not found in database!');
            console.log('   Creating First Officer rank...');
            
            await Rank.insertOne({
                name: 'First Officer',
                description: 'First Officer',
                requirement_hours: 80,
                requirement_flights: 0,
                auto_promote: true,
                allowed_aircraft: [],
                order: 2
            });
            console.log('   ✅ First Officer rank created');
        }

        // 4. Check if pilot qualifies
        const totalHours = (pilot.total_hours || 0) + (pilot.transfer_hours || 0);
        const totalFlights = pilot.total_flights || 0;

        console.log('\n🔍 Checking eligibility for First Officer:');
        console.log(`   Required: 80 hours, 0 flights`);
        console.log(`   Pilot has: ${totalHours} hours, ${totalFlights} flights`);
        console.log(`   Qualifies: ${totalHours >= 80 ? '✅ YES' : '❌ NO'}`);

        // 5. Manually upgrade if qualified
        if (totalHours >= 80 && pilot.rank === 'Cadet') {
            console.log('\n🚀 Upgrading pilot to First Officer...');
            await Pilot.updateOne(
                { pilot_id: 'LVT7FG' },
                { $set: { rank: 'First Officer' } }
            );
            console.log('   ✅ Pilot upgraded to First Officer!');
        } else if (pilot.rank !== 'Cadet') {
            console.log(`\n✅ Pilot already has rank: ${pilot.rank}`);
        } else {
            console.log('\n❌ Pilot does not qualify yet');
        }

        await mongoose.disconnect();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixRankUpgrade();
