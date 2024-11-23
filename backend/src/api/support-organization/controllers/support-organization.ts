/**
 * support-organization controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::support-organization.support-organization',
    ({ strapi }) => ({
        // Customize the findOne method
        async findOne(ctx) {
          const { id } = ctx.params;
    
          // Ensure the ID is numeric
          const organizationId = parseInt(id, 10);
          if (isNaN(organizationId)) {
            return ctx.badRequest("Invalid ID format");
          }
    
          // Fetch the author by ID using Strapi's db query API
          const supportOrganization = await strapi.db.query("api::support-organization.support-organization").findOne({
            where: { id: organizationId },
            // populate: ["books"], // Populate related data if needed
          });
    
          if (!supportOrganization) {
            return ctx.notFound("supportOrganization not found");
          }
    
          //return author;
    
          // You can add more custom logic here if needed
          // sanitizeOutput - exclude private fields from the response
          // This will prevent sensitive fields, like password, from being exposed in the response
          const sanitizedEntity = await this.sanitizeOutput(supportOrganization, ctx);
          return this.transformResponse(sanitizedEntity);
        },
      })
);
