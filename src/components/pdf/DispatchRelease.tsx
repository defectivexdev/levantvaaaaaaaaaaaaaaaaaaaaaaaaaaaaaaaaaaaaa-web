/**
 * Dispatch Release PDF Generator
 * Enterprise-grade flight dispatch document with QR code
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { DispatchRelease } from '@/types/flight';

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
    },
    header: {
        marginBottom: 20,
        borderBottom: '2 solid #000',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        backgroundColor: '#f0f0f0',
        padding: 5,
        borderLeft: '3 solid #FFD700',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: '40%',
        fontWeight: 'bold',
        color: '#333',
    },
    value: {
        width: '60%',
        color: '#000',
    },
    grid: {
        flexDirection: 'row',
        gap: 10,
    },
    gridItem: {
        flex: 1,
    },
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#333',
        color: '#fff',
        padding: 5,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1 solid #ddd',
        padding: 5,
    },
    tableCell: {
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        borderTop: '1 solid #ddd',
        paddingTop: 10,
        fontSize: 8,
        color: '#666',
    },
    qrCode: {
        width: 80,
        height: 80,
        marginTop: 10,
    },
    signature: {
        marginTop: 20,
        borderTop: '1 solid #000',
        paddingTop: 5,
        width: 200,
    },
    warning: {
        backgroundColor: '#fff3cd',
        border: '1 solid #ffc107',
        padding: 8,
        marginTop: 10,
        borderRadius: 4,
    },
});

// ============================================================================
// COMPONENT
// ============================================================================

interface DispatchReleasePDFProps {
    release: DispatchRelease;
}

export const DispatchReleasePDF: React.FC<DispatchReleasePDFProps> = ({ release }) => {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC',
            timeZoneName: 'short',
        });
    };

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}:${mins.toString().padStart(2, '0')}`;
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>FLIGHT DISPATCH RELEASE</Text>
                    <Text style={styles.subtitle}>Levant Virtual Airline</Text>
                    <Text style={styles.subtitle}>Release #{release.releaseNumber}</Text>
                </View>

                {/* Flight Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>FLIGHT INFORMATION</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Callsign:</Text>
                        <Text style={styles.value}>{release.callsign}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Aircraft:</Text>
                        <Text style={styles.value}>
                            {release.aircraft.type} ({release.registration})
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Captain:</Text>
                        <Text style={styles.value}>{release.captain}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Dispatcher:</Text>
                        <Text style={styles.value}>{release.dispatcher}</Text>
                    </View>
                </View>

                {/* Route Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ROUTE</Text>
                    <View style={styles.grid}>
                        <View style={styles.gridItem}>
                            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>DEPARTURE</Text>
                            <Text>{release.departure.icao} - {release.departure.name}</Text>
                            <Text style={{ fontSize: 8, color: '#666' }}>
                                {release.departure.city}, {release.departure.country}
                            </Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>ARRIVAL</Text>
                            <Text>{release.arrival.icao} - {release.arrival.name}</Text>
                            <Text style={{ fontSize: 8, color: '#666' }}>
                                {release.arrival.city}, {release.arrival.country}
                            </Text>
                        </View>
                    </View>
                    {release.alternate && (
                        <View style={{ marginTop: 10 }}>
                            <Text style={{ fontWeight: 'bold' }}>ALTERNATE</Text>
                            <Text>{release.alternate.icao} - {release.alternate.name}</Text>
                        </View>
                    )}
                    <View style={{ marginTop: 10 }}>
                        <Text style={{ fontWeight: 'bold' }}>ROUTE</Text>
                        <Text style={{ fontSize: 9, marginTop: 3 }}>{release.route}</Text>
                    </View>
                </View>

                {/* Schedule */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SCHEDULE</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Scheduled Departure:</Text>
                        <Text style={styles.value}>{formatDate(release.scheduledDeparture)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Estimated Arrival:</Text>
                        <Text style={styles.value}>{formatDate(release.estimatedArrival)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Flight Time:</Text>
                        <Text style={styles.value}>{formatTime(release.estimatedDuration)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Distance:</Text>
                        <Text style={styles.value}>{release.distance} NM</Text>
                    </View>
                </View>

                {/* Performance */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PERFORMANCE</Text>
                    <View style={styles.grid}>
                        <View style={styles.gridItem}>
                            <View style={styles.row}>
                                <Text style={styles.label}>Cruise Altitude:</Text>
                                <Text style={styles.value}>FL{Math.floor(release.cruiseAltitude / 100)}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Cruise Speed:</Text>
                                <Text style={styles.value}>{release.cruiseSpeed} kts</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Fuel Plan */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>FUEL PLAN</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableCell}>Item</Text>
                            <Text style={styles.tableCell}>Gallons</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Trip Fuel</Text>
                            <Text style={styles.tableCell}>{release.fuelPlan.tripFuel.toLocaleString()}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Contingency (5%)</Text>
                            <Text style={styles.tableCell}>{release.fuelPlan.contingency.toLocaleString()}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Alternate</Text>
                            <Text style={styles.tableCell}>{release.fuelPlan.alternate.toLocaleString()}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Final Reserve</Text>
                            <Text style={styles.tableCell}>{release.fuelPlan.finalReserve.toLocaleString()}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>Taxi</Text>
                            <Text style={styles.tableCell}>{release.fuelPlan.taxi.toLocaleString()}</Text>
                        </View>
                        <View style={[styles.tableRow, { backgroundColor: '#f0f0f0', fontWeight: 'bold' }]}>
                            <Text style={styles.tableCell}>TOTAL REQUIRED</Text>
                            <Text style={styles.tableCell}>{release.fuelPlan.totalRequired.toLocaleString()}</Text>
                        </View>
                        <View style={[styles.tableRow, { backgroundColor: '#FFD700', fontWeight: 'bold' }]}>
                            <Text style={styles.tableCell}>PLANNED ONBOARD</Text>
                            <Text style={styles.tableCell}>{release.fuelPlan.plannedOnboard.toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                {/* Weather */}
                {(release.departureMetar || release.arrivalMetar) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>WEATHER</Text>
                        {release.departureMetar && (
                            <View style={{ marginBottom: 8 }}>
                                <Text style={{ fontWeight: 'bold' }}>
                                    {release.departure.icao} METAR
                                </Text>
                                <Text style={{ fontSize: 9, fontFamily: 'Courier' }}>
                                    {release.departureMetar.rawText}
                                </Text>
                            </View>
                        )}
                        {release.arrivalMetar && (
                            <View>
                                <Text style={{ fontWeight: 'bold' }}>
                                    {release.arrival.icao} METAR
                                </Text>
                                <Text style={{ fontSize: 9, fontFamily: 'Courier' }}>
                                    {release.arrivalMetar.rawText}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Signatures */}
                <View style={{ marginTop: 30 }}>
                    <View style={styles.grid}>
                        <View style={styles.gridItem}>
                            <View style={styles.signature}>
                                <Text style={{ fontSize: 8, marginBottom: 20 }}>CAPTAIN SIGNATURE</Text>
                                <Text>_________________________</Text>
                                <Text style={{ fontSize: 8, marginTop: 3 }}>{release.captain}</Text>
                            </View>
                        </View>
                        <View style={styles.gridItem}>
                            <View style={styles.signature}>
                                <Text style={{ fontSize: 8, marginBottom: 20 }}>DISPATCHER SIGNATURE</Text>
                                <Text>_________________________</Text>
                                <Text style={{ fontSize: 8, marginTop: 3 }}>{release.dispatcher}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Generated: {formatDate(release.generatedAt)}</Text>
                    <Text>Valid Until: {formatDate(release.validUntil)}</Text>
                    <Text style={{ marginTop: 5 }}>
                        This is an official flight dispatch release for Levant Virtual Airline.
                        The Captain and Dispatcher certify that this flight is properly planned and safe to conduct.
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default DispatchReleasePDF;
