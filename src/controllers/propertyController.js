import Property from '../models/Property.js';

export const getPropertySummaries = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Fetch total count for pagination
        const total = await Property.countDocuments();

        // Fetch paginated properties
        const properties = await Property.find({}, {
            propertyName: 1,
            propertyType: 1,
            address: 1,
            frontImage: 1,
            bedrooms: 1,
            amenities: 1,
        })
            .skip(skip)
            .limit(limit);

        // If you have a field for ensuite bedrooms, replace ensuiteCount logic below
        const summaries = properties.map(p => ({
            propertyName: p.propertyName,
            propertyType: p.propertyType,
            address: p.address,
            frontImage: p.frontImage,
            bedrooms: p.bedrooms,
            ensuiteCount: 0, // Replace with p.ensuiteBedrooms or similar if available
            amenities: p.amenities
        }));

        res.json({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            properties: summaries
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getPropertyDetailById = async (req, res) => {
    try {
        const { id } = req.params;
        const p = await Property.findById(id, {
            propertyName: 1,
            description: 1,
            address: 1,
            billsIncluded: 1,
            bedrooms: 1,
            bathrooms: 1,
            amenities: 1,
            landlord: 1
        })
            .populate('landlord', 'firstName lastName email phoneNumber')
            .lean();

        if (!p) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const detail = {
            propertyName: p.propertyName,
            description: p.description,
            address: p.address,
            billsIncluded: p.billsIncluded,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            facilities: p.amenities,
            landlord: p.landlord ? {
                name: `${p.landlord.firstName} ${p.landlord.lastName}`,
                email: p.landlord.email,
                phoneNumber: p.landlord.phoneNumber
            } : null
        };
        res.json(detail);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
