import express from 'express';
import { store } from '../db/store.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// GET /api/space-telemetry/nodes
router.get('/nodes', (req, res) => {
  try {
    res.json({ nodes: store.spaceTelemetryNodes || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve space telemetry nodes' });
  }
});

// GET /api/space-telemetry/crew
router.get('/crew', (req, res) => {
  try {
    res.json({ crew: store.spaceCrewVitals || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve space crew vitals' });
  }
});

// POST /api/space-telemetry/ping
router.post('/ping', (req, res) => {
  try {
    const { nodeId } = req.body;
    const node = (store.spaceTelemetryNodes || []).find(n => n.id === nodeId) || store.spaceTelemetryNodes[0];

    res.json({
      message: `DTN telemetry bundle acknowledged by ${node ? node.missionName : 'Deep Space Relay'}. Delay-tolerant handshake synchronized.`,
      lightDistanceSeconds: node ? node.lightDistanceSeconds : 1.28,
      roundTripLatency: node ? node.delayCompensationLatencySec : 2.56,
      signalStrengthPercent: 99.4,
      node
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to synchronize DTN telemetry' });
  }
});

// POST /api/space-telemetry/adjust-lifesupport
router.post('/adjust-lifesupport', (req, res) => {
  try {
    const { nodeId, oxygenPercent, cabinPressureKPa } = req.body;
    const node = (store.spaceTelemetryNodes || []).find(n => n.id === nodeId) || store.spaceTelemetryNodes[0];

    if (node) {
      if (oxygenPercent) node.lifeSupportOxygenLevelPercent = parseFloat(oxygenPercent);
      if (cabinPressureKPa) node.cabinPressureKPa = parseFloat(cabinPressureKPa);
    }

    res.json({
      message: 'Autonomous habitat environmental life support adjusted and verified.',
      node
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to adjust habitat life support' });
  }
});

export default router;
